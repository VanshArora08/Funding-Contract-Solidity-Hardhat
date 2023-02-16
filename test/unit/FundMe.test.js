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
            const response = await fundMe.getAddressToAmountFunded(deployer);
            assert.equal(response.toString(), sendValue.toString());
        })
    })
    describe("withdraw", function () {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue })
        })
        it("should sent all balance in contract to deployer when withdraw is called", async () => {
            const stFundmeBal = await fundMe.provider.getBalance(fundMe.address)
            const stDeployerBal = await fundMe.provider.getBalance(deployer)
            const txresponse = await fundMe.withdraw();
            const txreciept = await txresponse.wait(1);
            const { gasUsed, effectiveGasPrice } = txreciept;
            const totalGasPrice = gasUsed.mul(effectiveGasPrice);

            const enDeployerBal = await fundMe.provider.getBalance(deployer)
            const enFundmeBal = await fundMe.provider.getBalance(fundMe.address)

            assert.equal(enFundmeBal.toString(), "0");
            assert.equal((stDeployerBal.add(stFundmeBal)).toString(), enDeployerBal.add(totalGasPrice).toString());
        })
    })
})
