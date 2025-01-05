// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PumpFunToken {
    // 代币基本信息
    string public name;
    string public symbol;
    uint256 public totalSupply;
    string public metadataUrl;

    // 每个地址的余额映射
    mapping(address => uint256) public balanceOf;
    // 授权转账额度映射
    mapping(address => mapping(address => uint256)) public allowance;

    // 事件
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // 构造函数，设置代币基本信息和初始供应
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        string memory _metadataUrl
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _initialSupply;
        metadataUrl = _metadataUrl;

        // 将初始供应分配给合约的部署者
        balanceOf[msg.sender] = _initialSupply;

        emit Transfer(address(0), msg.sender, _initialSupply);
    }

    // 转账函数
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        require(_to != address(0), "Invalid recipient address");

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    // 授权函数
    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(_spender != address(0), "Invalid spender address");

        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // 授权转账函数
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
}
