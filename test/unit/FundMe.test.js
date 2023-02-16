const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

describe("FundMe", function () {
    let fundMe
    let mockV3Aggregator
    let deployer
    let sendValue = ethers.utils.parseEther("1");
    //   const sendValue = ethers.utils.parseEther("1")
    beforeEach(async () => {
        // const accounts = await ethers.getSigners()
        // deployer = accounts[0]
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    describe("constructor", function () {
        it("sets the aggregator addresses correctly", async () => {
            const response = await fundMe.getPriceFeed();
            assert.equal(response, mockV3Aggregator.address)
        })
    })
    describe("fund", function () {
        it("revert error if enough eth is not sent", async () => {
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!");
        })
        it("update address to amount properly", async () => {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.s_addressToAmountFunded(deployer);
            assert.equal(response.toString(), sendValue.toString());
        })
    })
})
