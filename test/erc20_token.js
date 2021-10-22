const { expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
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

    it("should allow transfer from one account to another", async() => {
        const transferAmount = 100;
        const receipt = await ERC20Token.transfer(otherPerson, transferAmount, { from: owner });
        const otherPersonBalance = await ERC20Token.balanceOf(otherPerson);
        const ownerBalance = await ERC20Token.balanceOf(owner);

        expectEvent(receipt, "Transfer", {
            from: owner,
            to: otherPerson,
            tokens: web3.utils.toBN(transferAmount)
        });

        assert(otherPersonBalance.toNumber() === transferAmount);
        assert(ownerBalance.toNumber() === totalSupply - transferAmount);
    });

    it("should NOT allow transfer is person doesn't have enough tokens", async() => {
        const transferAmount = 100;
        await ERC20Token.transfer(otherPerson, transferAmount, { from: owner });

        await expectRevert(
            ERC20Token.transfer(owner, transferAmount + 10, { from: otherPerson }),
            "must have enough tokens to transfer"
        );
    });

    it("should allow approval for a delegated transfers", async() => {
        const transferAmount = web3.utils.toBN(100);
        const receipt = await ERC20Token.approve(otherSmartContract, transferAmount, { from: owner });
        const approvedAmount = await ERC20Token.allowance(owner, otherSmartContract);
        expectEvent(receipt, "Approval", {
            tokenOwner: owner,
            spender: otherSmartContract,
            tokens: transferAmount
        });
        assert(approvedAmount.eq(transferAmount));
    });

    it("should allow delegated transfer", async() => {
        const transferAmount = web3.utils.toBN(100);
        let receipt = await ERC20Token.approve(otherSmartContract, transferAmount, { from: owner });
        const approvedAmount = await ERC20Token.allowance(owner, otherSmartContract);
        assert(approvedAmount.eq(transferAmount));
        expectEvent(receipt, "Approval", {
            tokenOwner: owner,
            spender: otherSmartContract,
            tokens: transferAmount
        });

        receipt = await ERC20Token.transferFrom(owner, otherPerson, transferAmount, { from: otherSmartContract });
        expectEvent(receipt, "Transfer", {
            from: otherSmartContract,
            to: otherPerson,
            tokens: transferAmount
        });
        const otherPersonBalance = await ERC20Token.balanceOf(otherPerson);
        const ownerBalance = await ERC20Token.balanceOf(owner);

        assert(otherPersonBalance.eq(transferAmount));
        assert(ownerBalance.toNumber() === totalSupply - transferAmount.toNumber());
    });

    it("should NOT allow delegated transfer if account doesn't have enough tokens", async() => {
        const transferAmount = web3.utils.toBN(100);
        await ERC20Token.approve(otherSmartContract, transferAmount, { from: otherPerson })
        await expectRevert(
            ERC20Token.transferFrom(otherPerson, owner, transferAmount, { from: otherSmartContract }),
            "must have enough tokens and tokens approved to transfer"
        );
    });
});