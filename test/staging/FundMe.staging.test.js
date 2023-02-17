
const { assert } = require("chai");
const { network, ethers, getNamedAccounts } = require("hardhat");


describe("FundMe", async () => {
    let fundMe;
    let deployer;
    const sendVal = ethers.utils.parseEther("0.1")
    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)
    })
    it("allow users to fund and withdraw to owner", async () => {
        await fundMe.fund({ value: sendVal });
        await fundMe.withdraw();
        const endBal = await fundMe.provider.getBalance(fundMe.address);
        assert.equal(endBal.toString(), "0")
    })
})