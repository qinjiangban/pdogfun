// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {ERC20 as SolmateERC20} from "../../lib/solmate/tokens/ERC20.sol";

contract ERC20 is SolmateERC20 {
    uint256 public constant maxSupply = 1_000_000_000e18; // 1bil

    string public uri;

    /**
     * @notice contract constructor
     * NOTE: mints the max supply of 1bil to the caller contract (BonsaiLaunchpad) which is used to init a uni v4 pool
     */
    constructor(string memory name, string memory symbol, string memory _uri) SolmateERC20(name, symbol, 18) {
        _mint(msg.sender, maxSupply);
        uri = _uri;
    }
}