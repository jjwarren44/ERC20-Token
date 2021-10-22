const { expectRevert } = require("@openzeppelin/test-helpers");
const _ERC20Token = artifacts.require("ERC20Token.sol");

contract("ERC20Token", (accounts) => {
    let ERC20Token = null;
    const owner = accounts[0];
    const otherPerson = accounts[1];
    const otherSmartContract = accounts[2];
    const name = "Cool Token";
    const symbol = "COOL";
    const totalSupply = 10000;
    const decimals = 18;

    beforeEach(async() => {
        ERC20Token = await _ERC20Token.new(name, symbol, decimals, totalSupply, { from: owner });
    });

    it("should initialize correct values", async() => {
        const _name = await ERC20Token.name();
        const _symbol = await ERC20Token.symbol();
        const _totalSupply = await ERC20Token.totalSupply();
        const _decimals = await ERC20Token.decimals();
        const ownerBalance = await ERC20Token.balanceOf(owner);

        assert(_name === name);
        assert(_symbol === symbol);
        assert(_totalSupply.toNumber() === totalSupply);
        assert(_decimals.toNumber() === decimals);
        assert(ownerBalance.toNumber() === totalSupply);
    });
})