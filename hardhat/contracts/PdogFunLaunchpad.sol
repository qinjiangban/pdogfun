// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IPoolManager, BalanceDelta} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {LiquidityAmounts} from "v4-core/test/utils/LiquidityAmounts.sol";
import {IAllowanceTransfer} from "v4-periphery/lib/permit2/src/interfaces/IAllowanceTransfer.sol";
import {IPositionManager} from "v4-periphery/src/interfaces/IPositionManager.sol";
import {Actions} from "v4-periphery/src/libraries/Actions.sol";
import {PathKey} from "v4-periphery/src/libraries/PathKey.sol";
import {IV4Router} from "v4-periphery/src/interfaces/IV4Router.sol";
import {FixedPointMathLib} from "solady/utils/FixedPointMathLib.sol";
import {ERC20} from "./tokens/ERC20.sol";
import {IUniversalRouter, Commands} from "./interfaces/IUniversalRouter.sol";
import {IUniswapV3Factory} from "./interfaces/uniswapV3/IUniswapV3Factory.sol";
import {INonfungiblePositionManager} from "./interfaces/uniswapV3/INonfungiblePositionManager.sol";
import {IUniswapV3Pool} from "./interfaces/uniswapV3/IUniswapV3Pool.sol";
import {ISwapRouter} from "./interfaces/IUniswap.sol";

enum CURVE_TYPE {
    SOFT,
    NORMAL,
    STEEP
}

struct ClubData {
    address creator;
    address hook;
    uint256 supply;
    uint256 createdAt;
    uint256 liquidity;
    CURVE_TYPE curve;
    bytes token;
    uint256 complete;
}

struct SwapInfoV4 {
    PathKey[] path;
    IUniversalRouter router;
}

struct SwapInfoV3 {
    bytes path; // abi.encodePacked(address(QUOTE_TOKEN), 500, WETH9, 10000, BONSAI);
    address router;
}

/**
 * @title BonsaiLaunchpad
 * @notice Contract that allows anyone to create a bonding curve with the intention of accumulating enough liquidity
 * to pass the required threshold to create a pool on uni v3/v4. We call bonding curves "clubs".
 */
contract BonsaiLaunchpad is Ownable {
    using Address for address payable;
    using SafeERC20 for IERC20;

    error InitialTooLarge();
    error InvalidHook();
    error NotAllowed();
    error InvalidInput();
    error NotRegistered();
    error InsufficientPayment();
    error InsufficientBalance();
    error CannotSellLastChip();
    error InsufficientLiquidity();

    mapping(uint256 clubId => ClubData data) public registeredClubs;
    mapping(address account => uint256 amount) public feesEarned;
    mapping(uint256 clubId => mapping(address account => uint256 amount)) public balances; // paid for in quote token
    mapping(uint256 => uint256) public reservedTokens;
    mapping(uint256 => address) public clubToToken;
    mapping(address => bool) public whitelistedHooks;
    mapping(uint256 clubId => bytes) internal registeredClubHookData;

    event RegisteredClub(uint256 indexed clubId, address indexed creator, uint256 initialSupply);
    event Trade(
        uint256 clubId,
        uint256 amount,
        bool isBuy,
        address actor,
        uint256 price,
        uint256 priceAfterProtocolFee,
        bool complete,
        uint256 creatorFee
    );
    event Complete(uint256 indexed clubId);
    event LiquidityReleased(uint256 indexed clubId, address indexed token, address hook, uint256 agentCreatorAmount);
    event TokensClaimed(uint256 indexed clubId, address indexed user, uint256 amount);
    event UniswapFeesCollected(uint256 tokenId, address token0, address token1);
    event LiqThresholdSet(uint256 liquidityThreshold);
    event FeesSet(uint16 protocolFee, uint16 creatorFee, uint16 clientFee);
    event RampUpParametersSet(uint256 rampUpPeriod, uint256 maxInitialPurchasePercent);

    // fees (never going beyond PROTOCOL_FEES_BPS)
    uint16 internal protocolFeeBps;
    uint16 internal creatorFeeBps;
    uint16 internal clientFeeBps;

    address internal defaultHook;
    address internal agentCreator;

    uint256 public clubIdCount;
    uint256 internal registrationCost = 0;

    uint256 internal minLiquidityThreshold = 23_005; // 69k mcap
    uint256 internal claimWindow = 72 hours;

    IERC20 internal immutable QUOTE_TOKEN;
    IERC721 internal immutable BONSAI_NFT;
    address internal immutable BONSAI_TOKEN;

    uint8 internal constant DECIMALS = 6;
    uint8 internal immutable QUOTE_TOKEN_DECIMALS;

    uint16 internal constant PROTOCOL_FEES_BPS = 1000; // 10% on trades, with variable splits protocol/creator/client
    uint256 internal constant PRICE_DIVISOR_SOFT = 3_000_000_0000;
    uint256 internal constant PRICE_DIVISOR_NORMAL = 1_000_000_000;
    uint256 internal constant PRICE_DIVISOR_STEEP = 100_000_000;
    uint16 internal constant BPS_MAX = 10000;
    uint24 internal constant FEE_TIER = 15000; // 1.5% on uniswap pool
    address internal constant PERMIT2_ADDRESS = 0x000000000022D473030F116dDEE9F6B43aC78BA3; // base/sepolia

    uint256 quoteTokenPercentForPool = 95;
    uint256 quoteTokenPercentForAgent = 0;

    bool univ4 = false;

    // Snipe protection
    uint256 internal rampUpPeriod = 2 hours; // Configurable, minimum 2 hours
    uint256 internal maxInitialPurchasePercent = 100; // 1% (in basis points)

    // uni v4
    IPoolManager internal poolManager;
    IPositionManager internal posm;

    // uni v3
    IUniswapV3Factory internal immutable v3factory;
    INonfungiblePositionManager internal immutable v3positionManager;

    modifier onlyRegistered(uint256 clubId) {
        if (registeredClubs[clubId].createdAt == 0) revert NotRegistered();
        _;
    }

    /**
     * @notice contract constructor
     * @param _owner The contract owner
     * @param _quoteToken Quote token to trade against (USDC)
     * @param _poolManager Uniswap pool manager address
     * @param _defaultHook Default hook to use for all created uni v4 pools
     * @param _bonsaiNFT Bonsai NFT contract to read balances
     * @param _agentCreator Address to receive a % of liquidity for funding agents (initially 0)
     * @param _v3factory Address to Uni v3 Factory
     * @param _v3positionManager Address to Uni v3 PositionManager
     */
    constructor(
        address _owner,
        address _quoteToken,
        address _poolManager,
        address _posm,
        address _defaultHook,
        address _bonsaiNFT,
        address _bonsaiToken,
        address _agentCreator,
        address _v3factory,
        address _v3positionManager
    ) Ownable(_owner) {
        QUOTE_TOKEN = IERC20(_quoteToken);
        BONSAI_NFT = IERC721(_bonsaiNFT);
        BONSAI_TOKEN = _bonsaiToken;

        // Make a low-level call to get the decimals
        (bool success, bytes memory data) = address(_quoteToken).staticcall(abi.encodeWithSignature("decimals()"));
        require(success, "Failed to get decimals");
        QUOTE_TOKEN_DECIMALS = abi.decode(data, (uint8));

        poolManager = IPoolManager(_poolManager);
        posm = IPositionManager(_posm);
        defaultHook = _defaultHook;
        whitelistedHooks[_defaultHook] = true;
        agentCreator = _agentCreator;

        protocolFeeBps = 100; // 1
        creatorFeeBps = 100; // 1
        clientFeeBps = 100; // 1

        v3factory = IUniswapV3Factory(_v3factory);
        v3positionManager = INonfungiblePositionManager(_v3positionManager);

        // pre set up univ3 approvals
        IERC20(BONSAI_TOKEN).approve(address(v3positionManager), type(uint256).max);
    }

    /**
     * @notice Registers a new club with the info and mints the initial supply for `creator`. Requires the caller to
     * pay for the initial supply, to init the bonding curve. Must provided signed data proving ownership
     * @param hook Address of a univ4 hook for the token
     * @param token encoded bytes of the token (name, ticker, uri)
     * @param initialSupply The initial supply for the club chips
     * @param curve To set the steepness of the curve
     * @param creator The token creator
     */
    function registerClub(
        address hook,
        bytes calldata token,
        uint256 initialSupply,
        CURVE_TYPE curve,
        address creator
    ) external {
        if (hook == address(0)) hook = defaultHook;
        if (!whitelistedHooks[hook]) revert InvalidHook();
        if (creator == address(0)) creator = msg.sender;

        uint256 clubId = ++clubIdCount;

        // pay registration cost (for non-holders of bonsai nft)
        if (BONSAI_NFT.balanceOf(msg.sender) == 0 && registrationCost > 0) {
            QUOTE_TOKEN.safeTransferFrom(msg.sender, owner(), registrationCost * 10 ** QUOTE_TOKEN_DECIMALS);
        }

        // create initial liquidity
        uint256 initialLiquidity;
        if (initialSupply > 0) {
            initialLiquidity = _getPrice(0, initialSupply, curve);
            // max 10% of supply in initial buy
            if (initialLiquidity > (minLiquidityThreshold * 10 ** QUOTE_TOKEN_DECIMALS) / 10) revert InitialTooLarge();
            QUOTE_TOKEN.safeTransferFrom(msg.sender, address(this), initialLiquidity);
        }

        // bonding curve data
        registeredClubs[clubId] = ClubData({
            creator: creator,
            hook: hook,
            supply: initialSupply,
            createdAt: block.timestamp,
            liquidity: initialLiquidity,
            curve: curve,
            token: token,
            complete: 0
        });
        balances[clubId][creator] = initialSupply;

        emit RegisteredClub(clubId, creator, initialSupply);
    }

    /**
     * @notice Calculates the maximum allowed purchase and excess amount that will be taken as fees
     * @param price The total price being paid
     * @param clubId The club id
     * @return maxAllowed The maximum amount allowed to be spent on tokens
     * @return excess The amount that will be taken as fees
     */
    function calculatePurchaseAllocation(uint256 price, uint256 clubId)
        public
        view
        returns (uint256 maxAllowed, uint256 excess)
    {
        ClubData memory club = registeredClubs[clubId];
        if (club.createdAt == 0) return (0, price);
        if (club.complete != 0) return (0, price);

        uint256 baseAmount = minLiquidityThreshold * 10 ** QUOTE_TOKEN_DECIMALS;

        // After ramp period, allow any purchase
        if (block.timestamp >= club.createdAt + rampUpPeriod) {
            return (price, 0);
        }

        // During ramp period, linear increase from initial to 100%
        uint256 timeElapsed = block.timestamp - club.createdAt;
        uint256 percentageIncrease = ((BPS_MAX - maxInitialPurchasePercent) * timeElapsed) / rampUpPeriod;
        uint256 currentMaxPercent = maxInitialPurchasePercent + percentageIncrease;
        maxAllowed = (baseAmount * currentMaxPercent) / BPS_MAX;

        // Subtract already purchased amount to get remaining allowed
        maxAllowed = maxAllowed > club.liquidity ? maxAllowed - club.liquidity : 0;

        // Calculate excess
        if (price <= maxAllowed) {
            return (price, 0);
        }

        excess = price - maxAllowed;
        return (maxAllowed, excess);
    }

    /**
     * @notice Allows anyone to buy an `amount` of chips from a registered club with `clubId`. Must have approved the
     * price returned from `#getBuyPriceAfterFees` on quote token. Bonsai NFT holders pay 0 fees.
     * @param clubId The club id
     * @param amount The amount of club chips to buy
     * @param clientAddress The client address to receive fee split
     * @param recipient The recipient of the chips
     * @param referral The address to receive a referral split (33% of creator fee)
     */
    function buyChips(uint256 clubId, uint256 amount, address clientAddress, address recipient, address referral)
        external
        onlyRegistered(clubId)
    {
        if (recipient == address(0)) recipient = msg.sender;
        if (amount == 0) revert InsufficientPayment();

        ClubData storage club = registeredClubs[clubId];
        if (club.complete != 0) revert NotAllowed();

        uint256 price = getBuyPrice(clubId, amount);
        uint256 totalPrice;
        uint256 creatorFee;
        uint256 referralFee;

        // Calculate how much of the price can actually go to tokens vs fees (snipe protection)
        (uint256 maxAllowed, uint256 excessAmount) = calculatePurchaseAllocation(price, clubId);

        // If there's excess, recalculate the amount of tokens to buy
        if (excessAmount > 0) {
            amount = getTokensForSpend(clubId, maxAllowed);
            price = getBuyPrice(clubId, amount);
            // Recalculate excess based on new price
            excessAmount = price > maxAllowed ? price - maxAllowed : 0;
        }

        // no fees when msg.sender has a bonsai nft
        bool hasNft = BONSAI_NFT.balanceOf(msg.sender) > 0;

        if (hasNft && excessAmount == 0) {
            totalPrice = price;
        } else {
            // Calculate regular fees on the non-excess portion
            uint256 protocolFee = (price - excessAmount) * protocolFeeBps / BPS_MAX;
            creatorFee = (price - excessAmount) * creatorFeeBps / BPS_MAX;

            if (referral != address(0) && recipient != referral) {
                referralFee = creatorFee / 3;
                creatorFee -= referralFee;
                feesEarned[referral] += referralFee;
            }

            bool noClient = clientAddress == address(0) || clientAddress == recipient || clientAddress == msg.sender;
            uint256 clientFee =  noClient ? 0 : (price - excessAmount) * clientFeeBps / BPS_MAX;

            // Add excess amount to protocol fees
            protocolFee += excessAmount;
            totalPrice = price + protocolFee + creatorFee + clientFee;

            feesEarned[owner()] += protocolFee;
            feesEarned[club.creator] += creatorFee;
            feesEarned[clientAddress] += clientFee;
        }

        QUOTE_TOKEN.safeTransferFrom(msg.sender, address(this), totalPrice);

        balances[clubId][recipient] += amount;
        club.supply += amount;
        club.liquidity += (price - excessAmount); // Only count non-excess amount towards liquidity

        if (club.liquidity >= minLiquidityThreshold * 10 ** QUOTE_TOKEN_DECIMALS) {
            club.complete = block.timestamp;
        }

        emit Trade(clubId, amount, true, recipient, price, totalPrice, club.complete > 0, !hasNft ? creatorFee : 0);
    }

    /**
     * @notice Allows anyone to sell an `amount` of chips from a registered club with `clubId`. Bonsai NFT holders pay 0
     * fees.
     * @param clubId The club id
     * @param amount The amount of club chips to sell
     * @param clientAddress The client address to receive fee split
     */
    function sellChips(uint256 clubId, uint256 amount, address clientAddress) external onlyRegistered(clubId) {
        if (amount == 0 || amount > balances[clubId][msg.sender]) revert InsufficientBalance();
        ClubData storage club = registeredClubs[clubId];

        if (amount >= club.supply) revert CannotSellLastChip();
        if (club.complete != 0) revert NotAllowed();

        uint256 price = getSellPrice(clubId, amount);
        if (club.liquidity < price) revert InsufficientLiquidity();

        uint256 totalPrice;
        if (BONSAI_NFT.balanceOf(msg.sender) > 0) {
            totalPrice = price;
            emit Trade(clubId, amount, false, msg.sender, price, totalPrice, false, 0); // avoid stack trace too deep
        } else {
            uint256 protocolFee = price * protocolFeeBps / BPS_MAX;
            uint256 creatorFee = price * creatorFeeBps / BPS_MAX;
            uint256 clientFee = price * clientFeeBps / BPS_MAX;
            totalPrice = price - protocolFee - creatorFee - clientFee;

            feesEarned[owner()] += protocolFee;
            feesEarned[club.creator] += creatorFee;
            if (clientAddress != address(0) && clientAddress != msg.sender) {
                feesEarned[clientAddress] += clientFee;
            } else {
                feesEarned[owner()] += clientFee;
            }

            emit Trade(clubId, amount, false, msg.sender, price, totalPrice, false, creatorFee);
        }

        balances[clubId][msg.sender] -= amount;
        club.supply -= amount;
        club.liquidity -= price;

        QUOTE_TOKEN.safeTransfer(msg.sender, totalPrice);
    }

    /**
     * @notice Converts liquidity in bonding curve into a uniswap v4 pool. Must have reached liquidity threshold.
     * NOTE: only callable by the contract owner, done so from a backend service.
     * @param clubId Id of the club to convert
     * @param minAmountOut for a v4 swap
     * @param swapInfoV4 struct data for swapping into v4 pool
     * @param swapInfoV3 struct data for swapping into v3 pool
     */
    function releaseLiquidity(
        uint256 clubId,
        uint128 minAmountOut,
        SwapInfoV4 calldata swapInfoV4,
        SwapInfoV3 calldata swapInfoV3
    ) external onlyRegistered(clubId) onlyOwner {
        ClubData storage club = registeredClubs[clubId];

        if (club.complete == 0 || clubToToken[clubId] != address(0)) revert NotAllowed();
        club.complete = block.timestamp; // override to start the claim window countdown

        (string memory name, string memory symbol, string memory uri) = abi.decode(club.token, (string, string, string));
        ERC20 token = new ERC20(name, symbol, uri);

        uint256 totalSupply = token.maxSupply();
        uint256 tokensForPool = (totalSupply * 2) / 10; // 20% for Uniswap V4 pool

        uint256 quoteTokenForPool =
            quoteTokenPercentForPool * (minLiquidityThreshold * 10 ** QUOTE_TOKEN_DECIMALS) / 100;
        uint256 quoteTokenForAgent =
            quoteTokenPercentForAgent * (minLiquidityThreshold * 10 ** QUOTE_TOKEN_DECIMALS) / 100;
        // remaining tokens to treasury
        uint256 quoteTokenForTreasury = club.liquidity - quoteTokenForPool - quoteTokenForAgent;

        // swap quoteTokenForPool of USDC -> ETH -> Bonsai
        uint256 amountOut;
        if (univ4) {
            // univ4 swap
            tokenApproval(address(QUOTE_TOKEN), address(swapInfoV4.router));
            amountOut = swapExactInputV4(
                uint128(quoteTokenForPool), minAmountOut, swapInfoV4, address(QUOTE_TOKEN), BONSAI_TOKEN
            );
        } else {
            // univ3 swap
            QUOTE_TOKEN.approve(address(swapInfoV3.router), quoteTokenForPool);
            amountOut = swapExactInputV3(quoteTokenForPool, swapInfoV3);
        }

        // Sort token address and assign amounts accordingly
        (address c0, address c1) =
            address(token) < BONSAI_TOKEN ? (address(token), BONSAI_TOKEN) : (BONSAI_TOKEN, address(token));

        (uint256 c0Amount, uint256 c1Amount) =
            c0 == address(token) ? (tokensForPool, amountOut) : (amountOut, tokensForPool);

        // starting price is calculated based on output from swap
        uint160 startingPrice = uint160(
            (FixedPointMathLib.sqrt(FixedPointMathLib.divWad(c1Amount * 10e14, c0Amount)) * 2 ** 96) / 31622776601683795
        ); // magic num: sqrt(10) * 10e16

        int24 maxTick = 887220;

        if (univ4) {
            tokenApproval(address(token), address(posm));
            tokenApproval(BONSAI_TOKEN, address(posm));

            // Create Uniswap V4 pool
            PoolKey memory poolKey = PoolKey({
                currency0: Currency.wrap(c0),
                currency1: Currency.wrap(c1),
                fee: FEE_TIER,
                tickSpacing: 60,
                hooks: IHooks(club.hook)
            });

            bytes memory hookData = registeredClubHookData[clubId];
            poolManager.initialize(poolKey, startingPrice);

            // Add initial liquidity to the pool
            uint128 liquidity = LiquidityAmounts.getLiquidityForAmounts(
                startingPrice,
                TickMath.getSqrtPriceAtTick(-maxTick),
                TickMath.getSqrtPriceAtTick(maxTick),
                c0Amount,
                c1Amount
            );

            bytes memory actions = abi.encodePacked(uint8(Actions.MINT_POSITION), uint8(Actions.SETTLE_PAIR));
            bytes[] memory params = new bytes[](2);
            params[0] = abi.encode(poolKey, -maxTick, maxTick, liquidity, c0Amount, c1Amount, address(this), hookData);
            params[1] = abi.encode(Currency.wrap(c0), Currency.wrap(c1));
            uint256 deadline = block.timestamp;

            posm.modifyLiquidities(abi.encode(actions, params), deadline);
        } else {
            // Approve tokens for V3 position manager
            IERC20(address(token)).approve(address(v3positionManager), type(uint256).max);

            uint24 v3FeeTier = 10000;
            address pool = v3factory.createPool(c0, c1, v3FeeTier);
            IUniswapV3Pool(pool).initialize(startingPrice);

            // Prepare parameters for minting position
            maxTick = 887200;
            INonfungiblePositionManager.MintParams memory params = INonfungiblePositionManager.MintParams({
                token0: c0,
                token1: c1,
                fee: v3FeeTier,
                tickLower: -maxTick,
                tickUpper: maxTick,
                amount0Desired: c0Amount,
                amount1Desired: c1Amount,
                amount0Min: 0,
                amount1Min: 0,
                recipient: address(this),
                deadline: block.timestamp
            });

            // Mint position
            v3positionManager.mint(params);
        }

        // Store owner fees
        feesEarned[owner()] += quoteTokenForTreasury;

        if (quoteTokenForAgent > 0) {
            // Send creator agent funds
            QUOTE_TOKEN.safeTransfer(agentCreator, quoteTokenForAgent);
        }

        // Update club data
        clubToToken[clubId] = address(token);

        emit LiquidityReleased(clubId, address(token), club.hook, quoteTokenForAgent);
    }

    /**
     * @notice Burns shares from bonding curve to claim tokens
     * @param clubId the id of the bonding curve to claim from
     */
    function claimTokens(uint256 clubId, address recipient) external {
        if (recipient == address(0)) recipient = msg.sender;
        uint256 userBalance = balances[clubId][recipient];
        if (userBalance == 0) revert InsufficientBalance();

        ClubData storage club = registeredClubs[clubId];
        if (club.complete == 0 || clubToToken[clubId] == address(0)) revert NotAllowed();
        if (block.timestamp < club.complete + claimWindow) revert NotAllowed();
        ERC20 token = ERC20(clubToToken[clubId]);

        uint256 userShare = (((token.maxSupply() * 8) / 10) * userBalance) / club.supply;
        balances[clubId][recipient] = 0;
        token.transfer(recipient, userShare);

        emit TokensClaimed(clubId, recipient, userShare);
    }

    /**
     * @notice Allows anyone (treasury/owner, client) to withdraw fees earned
     */
    function withdrawFeesEarned(address recipient) external {
        if (recipient == address(0)) recipient = msg.sender;
        uint256 amount = feesEarned[recipient];
        feesEarned[recipient] = 0;
        QUOTE_TOKEN.safeTransfer(recipient, amount);
    }

    /**
     * @notice Collects LP fees from a Uniswap V4 position
     * @param tokenId ID of the LP position to collect fees from
     * @param token0 Address of the first token in the pair
     * @param token1 Address of the second token in the pair
     */
    function collectUniswapFees(uint256 tokenId, address token0, address token1) external {
        if (univ4) {
            // Sort token0 and token1 to ensure correct order
            if (uint160(token0) > uint160(token1)) {
                (token0, token1) = (token1, token0);
            }
            bytes memory actions = abi.encodePacked(uint8(Actions.DECREASE_LIQUIDITY), uint8(Actions.TAKE_PAIR));
            bytes[] memory params = new bytes[](2);
            params[0] = abi.encode(tokenId, 0, 0, 0, bytes32(0));
            params[1] = abi.encode(token0, token1, owner());
            uint256 deadline = block.timestamp + 60;
            posm.modifyLiquidities(abi.encode(actions, params), deadline);
        } else {
            // Collect fees from V3 position
            INonfungiblePositionManager.CollectParams memory params = INonfungiblePositionManager.CollectParams({
                tokenId: tokenId,
                recipient: owner(),
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            });

            v3positionManager.collect(params);
        }
        emit UniswapFeesCollected(tokenId, token0, token1);
    }

    /**
     * @notice Calculates the buy price for a given `clubId` club
     * @param amount The amount of club chips to buy
     * @param curve The steepness of the curve to set the club
     */
    function getRegistrationFee(uint256 amount, CURVE_TYPE curve) public view returns (uint256 fee) {
        if (BONSAI_NFT.balanceOf(msg.sender) == 0) {
            fee = registrationCost * 10 ** QUOTE_TOKEN_DECIMALS;
        }
        if (amount > 0) {
            fee += _getPrice(0, amount, curve);
        }
    }

    /**
     * @notice Calculates the amount of tokens that can be bought for a given price
     * @param clubId The club id
     * @param spendAmount The amount of quote tokens to spend
     * @return tokenAmount The amount of tokens that can be bought
     */
    function getTokensForSpend(uint256 clubId, uint256 spendAmount) public view returns (uint256 tokenAmount) {
        ClubData memory data = registeredClubs[clubId];

        // Binary search for the solution
        uint256 left = 0;
        uint256 right = 110e6; // reasonable upper limit

        while (left < right) {
            uint256 mid = (left + right + 1) / 2;
            uint256 price = _getPrice(data.supply, mid, data.curve);

            if (price <= spendAmount) {
                left = mid;
            } else {
                right = mid - 1;
            }
        }

        return left;
    }

    /**
     * @notice View function to get current fee configuration
     */
    function getFees() external view returns (uint16, uint16, uint16) {
        return (protocolFeeBps, creatorFeeBps, clientFeeBps);
    }

    /**
     * @notice Calculates the buy price for a given `clubId` club
     * @param clubId The club id
     * @param amount The amount of club chips to buy
     */
    function getBuyPrice(uint256 clubId, uint256 amount) public view returns (uint256) {
        ClubData memory data = registeredClubs[clubId];
        return _getPrice(data.supply, amount, data.curve);
    }

    /**
     * @notice Calculates the sell price for a given `clubId` club
     * @param clubId The club id
     * @param amount The amount of club chips to sell
     */
    function getSellPrice(uint256 clubId, uint256 amount) public view returns (uint256) {
        ClubData memory data = registeredClubs[clubId];
        return _getPrice(data.supply - amount, amount, data.curve);
    }

    /**
     * @notice Calculates the sell price for `amount` of `clubId` club chips after fees. Bonsai NFT holders pay 0 fees
     * @param clubId The club id
     * @param amount The amount of club chips to sell
     */
    function getSellPriceAfterFees(uint256 clubId, uint256 amount) external view returns (uint256) {
        uint256 price = getSellPrice(clubId, amount);

        if (BONSAI_NFT.balanceOf(msg.sender) > 0) return price;

        uint256 protocolFee = price * protocolFeeBps / BPS_MAX;
        uint256 creatorFee = price * creatorFeeBps / BPS_MAX;
        uint256 clientFee = price * clientFeeBps / BPS_MAX;
        return price - protocolFee - creatorFee - clientFee;
    }

    /**
     * @notice gets the current marketcap of a token
     */
    function getMcap(uint256 supply, CURVE_TYPE curve) public view returns (uint256) {
        uint256 price = _getPrice(supply, 1, curve);
        return price * supply;
    }

    /**
     * @notice Allows a club creator to set the curve type for their club
     */
    function setClubCurve(uint256 clubId, CURVE_TYPE curve) external {
        if (registeredClubs[clubId].creator != msg.sender) revert NotAllowed();
        registeredClubs[clubId].curve = curve;
    }

    /**
     * @notice Allows the contract owner to set protocol fee split between protocol/creator/client
     * @param _protocolFeeBps protocol fee
     * @param _creatorFeeBps creator fee
     * @param _clientFeeBps client fee
     */
    function setFees(uint16 _protocolFeeBps, uint16 _creatorFeeBps, uint16 _clientFeeBps) external onlyOwner {
        if (_protocolFeeBps + _creatorFeeBps + _clientFeeBps != PROTOCOL_FEES_BPS) revert NotAllowed();

        protocolFeeBps = _protocolFeeBps;
        creatorFeeBps = _creatorFeeBps;
        clientFeeBps = _clientFeeBps;
        emit FeesSet(_protocolFeeBps, _creatorFeeBps, _clientFeeBps);
    }

    /**
     * @notice Allows the contract owner to set the club min liquidity required before creating a uni pool
     * @param _minLiquidityThreshold The new threshold
     */
    function setMinLiquidityThreshold(uint256 _minLiquidityThreshold) external onlyOwner {
        minLiquidityThreshold = _minLiquidityThreshold;
        emit LiqThresholdSet(_minLiquidityThreshold);
    }

    /**
     * @notice allows owner to set the cost for registering a new coin
     * @param _registrationCost The new registration cost
     */
    function setRegistrationCost(uint256 _registrationCost) external onlyOwner {
        registrationCost = _registrationCost;
    }

    /**
     * @notice allows owner to set the percent of liquidity goes to pool
     * @param _quoteTokenPercentForPool The new percent for pool
     * @param _quoteTokenPercentForAgent The new percent for agent
     */
    function setQuoteTokenPercent(uint256 _quoteTokenPercentForPool, uint256 _quoteTokenPercentForAgent)
        external
        onlyOwner
    {
        require(_quoteTokenPercentForPool + _quoteTokenPercentForAgent <= 100, "over 100%");
        quoteTokenPercentForPool = _quoteTokenPercentForPool;
        quoteTokenPercentForAgent = _quoteTokenPercentForAgent;
    }

    /**
     * @notice allows owner to set uni v4 enabled
     * @param _univ4 Toggle
     */
    function setUniV4(bool _univ4, address _poolManager, address _posm) external onlyOwner {
        univ4 = _univ4;
        poolManager = IPoolManager(_poolManager);
        posm = IPositionManager(_posm);
    }

    /**
     * @notice allows owner to set the claim window countdown
     * @param _claimWindow The new registration cost
     */
    function setClaimWindow(uint256 _claimWindow) external onlyOwner {
        require(_claimWindow >= 1 hours, "too short");
        require(_claimWindow <= 7 days, "too long");
        claimWindow = _claimWindow;
    }

    /**
     * @notice allows owner to add or remove valid hooks
     * @param _hook Hook contract address
     * @param _whitelisted Is whitelisted toggle
     */
    function setWhitelistedHook(address _hook, bool _whitelisted) external onlyOwner {
        whitelistedHooks[_hook] = _whitelisted;
    }

    /**
     * @notice allows owner to set the default hook address
     * @param _defaultHook default hook address
     */
    function setDefaultHook(address _defaultHook) external onlyOwner {
        defaultHook = _defaultHook;
    }

    /**
     * @notice allows owner to set the agent creator address (if any)
     * @param _agentCreator Agent creator address
     */
    function setAgentCreator(address _agentCreator) external onlyOwner {
        agentCreator = _agentCreator;
    }

    /**
     * @notice Allows owner to set the ramp-up parameters for snipe protection
     * @param _rampUpPeriod Time period for the ramp-up (minimum 2 hours)
     * @param _maxInitialPurchasePercent Initial max purchase percent in BPS (e.g., 100 = 1%)
     */
    function setRampUpParameters(uint256 _rampUpPeriod, uint256 _maxInitialPurchasePercent) external onlyOwner {
        require(_rampUpPeriod >= 2 hours && _rampUpPeriod <= 7 days, "Min 2 hours, max 7 days");
        require(_maxInitialPurchasePercent <= BPS_MAX, "Initial must be <= 100%");
        require(_maxInitialPurchasePercent > 0, "Initial must be > 0");

        rampUpPeriod = _rampUpPeriod;
        maxInitialPurchasePercent = _maxInitialPurchasePercent;

        emit RampUpParametersSet(_rampUpPeriod, _maxInitialPurchasePercent);
    }

    function setRegisteredClubHookData(uint256 clubId, bytes calldata data) external onlyOwner {
        registeredClubHookData[clubId] = data;
    }

    /**
     * @dev Calculate the price on a bonding curve, accounting for decimals + curve steepness
     * @param supply The supply of club chips to account for
     * @param amount The amount of chips being bought/sold
     * @param curve The type of curve set for the club (soft, normal, steep)
     */
    function _getPrice(uint256 supply, uint256 amount, CURVE_TYPE curve) internal view returns (uint256) {
        uint256 summation;
        if (supply == 0) {
            summation = amount * (amount + 1) * (2 * amount + 1) / 6;
        } else {
            uint256 sum1 = (supply - 1) * supply * (2 * (supply - 1) + 1) / 6;
            uint256 sum2 = (supply - 1 + amount) * (supply + amount) * (2 * (supply - 1 + amount) + 1) / 6;
            summation = sum2 - sum1;
        }

        uint256 divisor;
        if (curve == CURVE_TYPE.SOFT) {
            divisor = PRICE_DIVISOR_SOFT;
        } else if (curve == CURVE_TYPE.NORMAL) {
            divisor = PRICE_DIVISOR_NORMAL;
        } else {
            divisor = PRICE_DIVISOR_STEEP;
        }

        uint256 decimalAdjustment = 10 ** (18 - QUOTE_TOKEN_DECIMALS);

        return (summation * 1 gwei / divisor / DECIMALS) / decimalAdjustment;
    }

    /**
     * @dev Approves token with Permit2 to be used with Uniswap
     * @param _token Token contract address
     */
    function tokenApproval(address _token, address _operator) internal {
        IERC20 token = IERC20(_token);
        IAllowanceTransfer PERMIT2 = IAllowanceTransfer(PERMIT2_ADDRESS);
        token.approve(address(PERMIT2), type(uint256).max);
        PERMIT2.approve(address(token), address(_operator), type(uint160).max, type(uint48).max);
    }

    // UNISWAP SWAPPING HELPERS

    /// @notice swap USDC to BONSAI on UniV3
    function swapExactInputV3(uint256 amountIn, SwapInfoV3 calldata swapInfo) internal returns (uint256 amountOut) {
        ISwapRouter.ExactInputParams memory params = ISwapRouter.ExactInputParams({
            path: swapInfo.path,
            recipient: address(this),
            amountIn: amountIn,
            amountOutMinimum: 0
        });
        return ISwapRouter(swapInfo.router).exactInput(params);
    }

    /// @notice swap USDC to BONSAI on UniV4
    function swapExactInputV4(
        uint128 amountIn,
        uint128 minAmountOut,
        SwapInfoV4 calldata swapInfo,
        address currency0,
        address currency1
    ) internal returns (uint256 amountOut) {
        // Encode the Universal Router command
        bytes memory commands = abi.encodePacked(uint8(Commands.V4_SWAP));
        bytes[] memory inputs = new bytes[](1);

        // Encode V4Router actions
        bytes memory actions =
            abi.encodePacked(uint8(Actions.SWAP_EXACT_IN), uint8(Actions.SETTLE_ALL), uint8(Actions.TAKE_ALL));

        // Prepare parameters for each action
        bytes[] memory params = new bytes[](3);
        params[0] = abi.encode(
            IV4Router.ExactInputParams({
                currencyIn: Currency.wrap(address(QUOTE_TOKEN)),
                path: swapInfo.path,
                amountIn: amountIn,
                amountOutMinimum: minAmountOut
            })
        );
        params[1] = abi.encode(Currency.wrap(currency0), amountIn);
        params[2] = abi.encode(Currency.wrap(currency1), minAmountOut);

        // Combine actions and params into inputs
        inputs[0] = abi.encode(actions, params);

        // Execute the swap
        swapInfo.router.execute(commands, inputs, block.timestamp);

        // Verify and return the output amount
        amountOut = IERC20(currency1).balanceOf(address(this));
        require(amountOut >= minAmountOut, "Insufficient output amount");
        return amountOut;
    }
}
