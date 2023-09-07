// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./OrgTokenTemplate.sol";

contract VestingService {
    // FIELDS
    mapping(string => Organization) public organizations;
    string[] public orgNames;

    // STRUCTS
    struct Organization {
        address token;
        address admin;
        mapping(address => Member) members;
        address[] memberAddresses;
    }

    struct Member {
        string memberRole;
        Vest[] vests;
    }

    struct Vest {
        uint availableAfterTimestamp;
        uint amount;
        bool claimed;
    }

    // EVENTS
    event OrganizationCreated(string indexed orgNameIndex, string orgName, address token, address admin);
    event MemberWhitelisted(string indexed orgNameIndex, string orgName, address member, string role);
    event VestAdded(string indexed orgNameIndex, string orgName, address indexed member, uint availableAfterTimestamp, uint amount);
    event VestsClaimed(string indexed orgNameIndex, string orgName, address indexed member, uint amount);

    // VIEWS
    function getOrgCount() external view returns (uint count) {
        return orgNames.length;
    }

    function getOrgNames() external view returns (string[] memory orgs) {
        return orgNames;
    }

    function getOrgMembers(string calldata orgName) external view returns (address[] memory memberAddresses) {
        return organizations[orgName].memberAddresses;
    }

    function getMemberInfo(string calldata orgName, address memberAddress) external view returns (Vest[] memory vests, string memory memberRole) {
        Member memory member = organizations[orgName].members[memberAddress];
        return (member.vests, member.memberRole);
    }

    // BUSINESS LOGIC
    function registerOrganization(string calldata orgName, string calldata tokenName, string calldata tokenTicker, uint8 tokenDecimals) external {
        // Make sure org with this name doesn't exist
        require(organizations[orgName].token == address(0), "Organization already exists");

        // Deploy a new ERC20 token for the org
        OrgTokenTemplate token = new OrgTokenTemplate(tokenName, tokenTicker, tokenDecimals);

        // Create new org struct
        Organization storage org = organizations[orgName];
        org.admin = msg.sender;
        org.token = address(token);

        orgNames.push(orgName);
        emit OrganizationCreated(orgName, orgName, address(token), msg.sender);
    }

    function whitelistMember(string calldata orgName, string calldata memberRole, address memberAddress) external {
        Organization storage org = organizations[orgName];
        // Make sure org with this name exists
        require(org.token != address(0), "Organization doesn't exist");
        // Make sure sender is admin for the org
        require(msg.sender == org.admin, "Caller is not admin for this org");

        // Fill in member type for this member
        Member storage member = org.members[memberAddress];
        member.memberRole = memberRole;

        org.memberAddresses.push(memberAddress);
        emit MemberWhitelisted(orgName, orgName, memberAddress, memberRole);
    }

    function addVest(string calldata orgName, address memberAddress, uint availableAfterTimestamp, uint amount) external {
        Organization storage org = organizations[orgName];
        // Make sure org with this name exists
        require(org.token != address(0), "Organization doesn't exist");
        // Make sure sender is admin for the org
        require(msg.sender == org.admin, "Caller is not admin for this org");
        // Make sure memberAddress is whitelisted
        require(bytes(org.members[memberAddress].memberRole).length != 0, "Member is not whitelisted");

        Vest memory vest = Vest(availableAfterTimestamp, amount, false);
        org.members[memberAddress].vests.push(vest);
        emit VestAdded(orgName, orgName, memberAddress, availableAfterTimestamp, amount);
    }

    function claimVests(string calldata orgName) external {
        Organization storage org = organizations[orgName];
        // Make sure org with this name exists  
        require(org.token != address(0), "Organization doesn't exist");
        // Make sure sender is whitelisted
        require(bytes(org.members[msg.sender].memberRole).length != 0, "Caller is not whitelisted");
        
        // Find total token amount from all vests
        Vest[] storage vests = org.members[msg.sender].vests;
        uint total = 0;
        for (uint i = 0; i < vests.length; i++) {
            if (!vests[i].claimed && vests[i].availableAfterTimestamp < block.timestamp) {
                total += vests[i].amount;
                vests[i].claimed = true;
            }
        }

        //Transfer the correct amount of token
        OrgTokenTemplate token = OrgTokenTemplate(org.token);
        token.mint(msg.sender, total);
        emit VestsClaimed(orgName, orgName, msg.sender, total);
    }
}
