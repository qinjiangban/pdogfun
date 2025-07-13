// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PumpFunToken {
    string public name;
    string public symbol;
    uint256 public totalSupply;
    uint8 public decimals;
    string public metadataUrl;
    string public logoUrl;
    string public bio;
    address public owner;
    
    // Social media links
    string public webSite;
    string public lensSite;
    string public xSite;
    string public telegramSite;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event MetadataUpdated(string newMetadataUrl);
    event LogoUpdated(string newLogoUrl);
    event SocialLinksUpdated(string webSite, string lensSite, string xSite, string telegramSite);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        string memory _metadataUrl,
        string memory _logoUrl,
        string memory _bio,
        string memory _webSite,
        string memory _lensSite,
        string memory _xSite,
        string memory _telegramSite
    ) {
        name = _name;
        symbol = _symbol;
        decimals = 18;
        totalSupply = _initialSupply * 10**decimals;
        metadataUrl = _metadataUrl;
        logoUrl = _logoUrl;
        bio = _bio;
        owner = msg.sender;
        
        // Set social media links
        webSite = _webSite;
        lensSite = _lensSite;
        xSite = _xSite;
        telegramSite = _telegramSite;

        balanceOf[msg.sender] = totalSupply;

        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        require(_to != address(0), "Invalid recipient address");

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(_spender != address(0), "Invalid spender address");

        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "Allowance exceeded");
        require(_to != address(0), "Invalid recipient address");

        balanceOf[_from] -= _value;
        allowance[_from][msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(_from, _to, _value);
        return true;
    }
    
    // Update metadata URL (only owner)
    function updateMetadata(string memory _newMetadataUrl) public onlyOwner {
        metadataUrl = _newMetadataUrl;
        emit MetadataUpdated(_newMetadataUrl);
    }
    
    // Update logo URL (only owner)
    function updateLogo(string memory _newLogoUrl) public onlyOwner {
        logoUrl = _newLogoUrl;
        emit LogoUpdated(_newLogoUrl);
    }
    
    // Update social media links (only owner)
    function updateSocialLinks(
        string memory _webSite,
        string memory _lensSite,
        string memory _xSite,
        string memory _telegramSite
    ) public onlyOwner {
        webSite = _webSite;
        lensSite = _lensSite;
        xSite = _xSite;
        telegramSite = _telegramSite;
        emit SocialLinksUpdated(_webSite, _lensSite, _xSite, _telegramSite);
    }
    
    // Get token info
    function getTokenInfo() public view returns (
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint8 _decimals,
        string memory _metadataUrl,
        string memory _logoUrl,
        string memory _bio
    ) {
        return (name, symbol, totalSupply, decimals, metadataUrl, logoUrl, bio);
    }
    
    // Get social links
    function getSocialLinks() public view returns (
        string memory _webSite,
        string memory _lensSite,
        string memory _xSite,
        string memory _telegramSite
    ) {
        return (webSite, lensSite, xSite, telegramSite);
    }
}
