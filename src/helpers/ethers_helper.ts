import { ExternalProvider } from "@ethersproject/providers";
import { Eip1193Provider, ethers } from "ethers";
import { OrgTokenTemplate__factory, VestingService__factory } from "../../typechain-types";
import { VestingService } from "../../typechain-types/contracts/VestingService";
import { Dispatch, SetStateAction } from "react";
import { Member, Vest, Organization, OrganizationInformation } from "../interfaces/organization";

declare global {
  interface Window {
    ethereum?: ExternalProvider;
  }
}

const VESTING_SERTICE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VESTING_SERVICE_CONTRACT_ADDRESS

export function getWallet() { 
    return window.ethereum
}

export async function getAccount(): Promise<string|undefined> {
    if (window.ethereum) {
      const accounts = await window.ethereum.request!!({method: "eth_accounts"});
      return accounts[0]
    } else {
        return undefined
    }
}

export async function connectAccount(): Promise<string|undefined> {
    if (!window.ethereum) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await window.ethereum.request!!({ method: 'eth_requestAccounts' });
    console.log(accounts)
    return accounts[0]
}

export async function getVestingServiceContract(setContract: Dispatch<SetStateAction<VestingService | undefined>>, updatePage: (vestingServiceContract: VestingService) => Promise<void>) {
    // First setting up listeners
    const readonlyProvider = new ethers.JsonRpcProvider();
    const readOnlyContract = await VestingService__factory.connect(VESTING_SERTICE_CONTRACT_ADDRESS!!, readonlyProvider);
    readOnlyContract.on(readOnlyContract.filters.OrganizationCreated, async (orgNameIndex, orgName, token, admin) => {
        window.alert(`Org ${orgName.toString()} created successfully!`);
        await updatePage(readOnlyContract)
    })
    readOnlyContract.on(readOnlyContract.filters.MemberWhitelisted, async (orgNameIndex, orgName, member, role) => {
        window.alert(`Member ${member} successfully whitelisted for ${orgName} org!`);
        await updatePage(readOnlyContract)
    })
    readOnlyContract.on(readOnlyContract.filters.VestAdded, async (orgNameIndex, orgName, member, availableAfterTimestamp, amount) => {
        window.alert(`A vest of ${amount} successfully created for member ${member}!`);
        await updatePage(readOnlyContract)
    })
    readOnlyContract.on(readOnlyContract.filters.VestsClaimed, async (orgNameIndex, orgName, member, amount) => {
        window.alert(`Member ${member} successfully claimed ${amount} tokens!`);
        await updatePage(readOnlyContract)
    })
    
    // Next making a write contract for signing transactions with metamask
    const browserProvider = new ethers.BrowserProvider(window.ethereum!! as Eip1193Provider);
    const signer = await browserProvider.getSigner();
    const vestingServiceContract = await VestingService__factory.connect(VESTING_SERTICE_CONTRACT_ADDRESS!!, signer);
    
    console.log("Loaded contract successfully!")
    setContract(vestingServiceContract)
}

export async function loadMainPageInfo(vestingServiceContract: VestingService, setOrgs: Dispatch<SetStateAction<Organization[] | undefined>>) {
    const readonlyProvider = new ethers.JsonRpcProvider();

    console.log("Loading org names")
    let orgNames = await vestingServiceContract.getOrgNames()
    console.log(orgNames)
    let orgs: Organization[] = [];
    for await (let orgName of orgNames) {
        let org = await vestingServiceContract.organizations(orgName)
        const tokenContract = await OrgTokenTemplate__factory.connect(org.token, readonlyProvider);
        let tokenName = await tokenContract.name()
        let tokenTicker = await tokenContract.symbol()

        orgs.push({
            token: org.token,
            admin: org.admin,
            name: orgName, 
            tokenName: tokenName,
            tokenTicker: tokenTicker
        } as Organization)
    }
    setOrgs(orgs);
}

export async function loadOrgPageInfo(orgName: string, vestingServiceContract: VestingService, setOrgInfo: Dispatch<SetStateAction<OrganizationInformation | undefined>>) {
    const readonlyProvider = new ethers.JsonRpcProvider();

    let orgData
    try {
        orgData = await vestingServiceContract.organizations(orgName)
    } catch(e) {
        console.log("caught")
        setOrgInfo({
            org: undefined,
            members: undefined
        })
        return
    }
    const tokenContract = await OrgTokenTemplate__factory.connect(orgData.token, readonlyProvider);
    let tokenName = await tokenContract.name()
    let tokenTicker = await tokenContract.symbol()
    let org = {
        token: orgData.token,
        admin: orgData.admin,
        name: orgName, 
        tokenName: tokenName,
        tokenTicker: tokenTicker
    } as Organization

    let memberAddresses = await vestingServiceContract.getOrgMembers(orgName);
    let members: Member[] = [];
    for await (let address of memberAddresses) {
        let memInfo = await vestingServiceContract.getMemberInfo(orgName, address)

        members.push({
            address: address,
            role: memInfo.memberRole,
            vests: memInfo.vests.map((v) => {
                return {
                    availableAfterTimestamp: Number(v.availableAfterTimestamp),
                    amount: Number(v.amount),
                    claimed: v.claimed
                } as Vest
            })
        } as Member)
    }

    setOrgInfo({
        org: org,
        members: members
    } as OrganizationInformation)
}
