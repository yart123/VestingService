import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { OrgTokenTemplate__factory } from '../typechain-types'; 

describe("VestingService", function () {  
    const TEST_ORG = "Test Org"

    async function blankContract() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const VestingService = await ethers.getContractFactory("VestingService");
        const vestingService = await VestingService.deploy();

        return { vestingService, owner, otherAccount };
    }
  
    it("Vesting Service End-to-End test", async function () {
        const { vestingService, owner, otherAccount: memberAccount } = await loadFixture(blankContract);
        expect(await vestingService.getOrgCount()).to.equal(0);

        // Register organization, confirm there's now one org without members
        await vestingService.registerOrganization(TEST_ORG, "Test Token", "TST", 0);
        let org = await vestingService.organizations(TEST_ORG);
        expect(await vestingService.getOrgCount()).to.equal(1);
        expect(org.admin).to.equal(owner.address);
        expect((await vestingService.getOrgMembers(TEST_ORG)).length).to.equal(0);

        // Add a member, confirm member was created successfully
        await vestingService.whitelistMember(TEST_ORG, "Founder", memberAccount);
        let orgMembers = await vestingService.getOrgMembers(TEST_ORG);
        expect(orgMembers.length).to.equal(1);
        let memberInfo = await vestingService.getMemberInfo(TEST_ORG, memberAccount);
        expect(memberInfo.memberRole).to.equal("Founder");
        expect(memberInfo.vests.length).to.equal(0);

        // Add 2 vests, verify they were created successfully
        await vestingService.addVest(TEST_ORG, memberAccount, 946684800, 1337);
        await vestingService.addVest(TEST_ORG, memberAccount, 946684900, 420);
        let memberInfoWithVest = await vestingService.getMemberInfo(TEST_ORG, memberAccount);
        expect(memberInfoWithVest.vests.length).to.equal(2);
        expect(memberInfoWithVest.vests[0].amount).to.equal(1337);
        expect(memberInfoWithVest.vests[0].availableAfterTimestamp).to.equal(946684800);
        expect(memberInfoWithVest.vests[1].amount).to.equal(420);
        expect(memberInfoWithVest.vests[1].availableAfterTimestamp).to.equal(946684900);

        // Claim vests, confirm they were removed after claiming
        await vestingService.connect(memberAccount).claimVests(TEST_ORG);
        let memberInfoAfterClaim = await vestingService.getMemberInfo(TEST_ORG, memberAccount);
        expect(memberInfoAfterClaim.vests[0].claimed).to.equal(true);
        expect(memberInfoAfterClaim.vests[1].claimed).to.equal(true);

        // Validate the member received correct number of tokens from the vests
        const orgTokenContract = OrgTokenTemplate__factory.connect(org.token, owner);
        const balance = await orgTokenContract.balanceOf(memberAccount);
        expect(balance).to.equal(420 + 1337);
    });

    it("Register organization fails when called twice", async function () {
        const { vestingService, otherAccount: memberAccount } = await loadFixture(blankContract);

        await vestingService.registerOrganization(TEST_ORG, "Test Token", "TST", 0);
        await expect(vestingService.registerOrganization(TEST_ORG, "Test Token", "TST", 0))
        .to.be.revertedWith("Organization already exists");
    });

    it("Whitelist member fails for non-existing organization", async function () {
        const { vestingService, otherAccount: memberAccount } = await loadFixture(blankContract);

        await expect(vestingService.whitelistMember("Garbage Inc", "Founder", memberAccount))
        .to.be.revertedWith("Organization doesn't exist");
    });

    it("Whitelist member fails when caller is not admin", async function () {
        const { vestingService, otherAccount: memberAccount } = await loadFixture(blankContract);

        await vestingService.registerOrganization(TEST_ORG, "Test Token", "TST", 0);
        await expect(vestingService.connect(memberAccount).whitelistMember(TEST_ORG, "Founder", memberAccount))
        .to.be.revertedWith("Caller is not admin for this org");
    });

    it("Add vest fails for non-existing organization", async function () {
        const { vestingService, otherAccount: memberAccount } = await loadFixture(blankContract);

        await expect(vestingService.addVest("Garbage Inc", memberAccount, 946684800, 1337))
        .to.be.revertedWith("Organization doesn't exist");
    });

    it("Add vest fails when caller is not admin", async function () {
        const { vestingService, otherAccount: memberAccount } = await loadFixture(blankContract);

        await vestingService.registerOrganization(TEST_ORG, "Test Token", "TST", 0);
        await expect(vestingService.connect(memberAccount).addVest(TEST_ORG, memberAccount, 946684800, 1337))
        .to.be.revertedWith("Caller is not admin for this org");
    });

    it("Claim vest fails for non-existing organization", async function () {
        const { vestingService, otherAccount: memberAccount } = await loadFixture(blankContract);

        await expect(vestingService.connect(memberAccount).claimVests(TEST_ORG))
        .to.be.revertedWith("Organization doesn't exist");
    });

    it("Claim vest fails for non-whitelisted members", async function () {
        const { vestingService, otherAccount: memberAccount } = await loadFixture(blankContract);

        await vestingService.registerOrganization(TEST_ORG, "Test Token", "TST", 0);
        await expect(vestingService.connect(memberAccount).claimVests(TEST_ORG))
        .to.be.revertedWith("Caller is not whitelisted");
    });

    it("Multiple claims don't give extra tokens", async function () {
        const { vestingService, owner, otherAccount: memberAccount } = await loadFixture(blankContract);

        // Setup an org with a member who has 2 vests
        await vestingService.registerOrganization(TEST_ORG, "Test Token", "TST", 0);
        await vestingService.whitelistMember(TEST_ORG, "Founder", memberAccount);
        await vestingService.addVest(TEST_ORG, memberAccount, 946684800, 1337);
        await vestingService.addVest(TEST_ORG, memberAccount, 946684900, 420);

        // Claim vests multiple times
        await vestingService.connect(memberAccount).claimVests(TEST_ORG);
        await vestingService.connect(memberAccount).claimVests(TEST_ORG);
        await vestingService.connect(memberAccount).claimVests(TEST_ORG);

        // Validate the member received correct number of tokens from the vests
        let org = await vestingService.organizations(TEST_ORG);
        const orgTokenContract = OrgTokenTemplate__factory.connect(org.token, owner);
        const balance = await orgTokenContract.balanceOf(memberAccount);
        expect(balance).to.equal(420 + 1337);
    });

    it("Unvested tokens are not being claimed", async function () {
        const { vestingService, owner, otherAccount: memberAccount } = await loadFixture(blankContract);

        // Setup an org with a member who has 2 vests
        await vestingService.registerOrganization(TEST_ORG, "Test Token", "TST", 0);
        await vestingService.whitelistMember(TEST_ORG, "Founder", memberAccount);
        await vestingService.addVest(TEST_ORG, memberAccount, 1946684800, 1337); // This one is not vested
        await vestingService.addVest(TEST_ORG, memberAccount, 946684900, 420);

        // Claim vests multiple times
        await vestingService.connect(memberAccount).claimVests(TEST_ORG);

        // Validate the member received correct number of tokens from the vests
        let org = await vestingService.organizations(TEST_ORG);
        const orgTokenContract = OrgTokenTemplate__factory.connect(org.token, owner);
        const balance = await orgTokenContract.balanceOf(memberAccount);
        expect(balance).to.equal(420);
    });

    it("Claim on no vests succeeds", async function () {
        const { vestingService, owner, otherAccount: memberAccount } = await loadFixture(blankContract);

        // Setup an org with a member who has 2 vests
        await vestingService.registerOrganization(TEST_ORG, "Test Token", "TST", 0);
        await vestingService.whitelistMember(TEST_ORG, "Founder", memberAccount);

        // Claim vests multiple times
        await vestingService.connect(memberAccount).claimVests(TEST_ORG);

        // Validate the member received correct number of tokens from the vests
        let org = await vestingService.organizations(TEST_ORG);
        const orgTokenContract = OrgTokenTemplate__factory.connect(org.token, owner);
        const balance = await orgTokenContract.balanceOf(memberAccount);
        expect(balance).to.equal(0);
    });
});
