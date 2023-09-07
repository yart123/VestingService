'use client'
import { ExternalProvider } from "@ethersproject/providers";
import { useEffect, useState } from 'react';
import { WalletConnector } from "../../../src/components/wallet_connector";
import { VestingService } from "../../../typechain-types";
import { useParams } from "next/navigation";
import { getVestingServiceContract, loadOrgPageInfo } from "../../../src/helpers/ethers_helper";
import { OrganizationInformation } from "../../../src/interfaces/organization";
import { OrgDisplayer } from "../../../src/components/org_displayer";
import { MemberWhitelister } from "../../../src/components/member_whitelister";
import { MemberList } from "../../../src/components/member_list";
import { VestCreator } from "../../../src/components/vest_creator";
import { VestClaimer } from "../../../src/components/vest_claimer";

export default function IndexPage({
}) {
    const [wallet, setWallet] = useState<ExternalProvider|undefined>(undefined);
    const [account, setAccount] = useState<string|undefined>(undefined);
    const [vestingServiceContract, setVSContract] = useState<VestingService|undefined>(undefined);
    const [orgInfo, setOrgInfo] = useState<OrganizationInformation|undefined>(undefined);
    const orgname: string = useParams().orgname as string
    
    if (vestingServiceContract && !orgInfo) {
        loadOrgPageInfo(orgname, vestingServiceContract, setOrgInfo)
            .catch(console.error)
    }

    useEffect(() => {
        if (!vestingServiceContract) {
            getVestingServiceContract(setVSContract, async (vestingServiceContract) => { loadOrgPageInfo(orgname, vestingServiceContract, setOrgInfo) })
                .catch(console.error)
        } 
      }, []);
    
    return (
        <>
            <WalletConnector {...{
                wallet: wallet,
                account: account,
                setWallet: setWallet,
                setAccount: setAccount
            }} />
            <div className="pageContent">
                <h1>{orgname} Vesting Page</h1>
                <MemberList {...{
                    members: orgInfo?.members,
                    tokenTicker: orgInfo?.org?.tokenTicker!!
                }} />
                <OrgDisplayer organization={orgInfo?.org} />
                <MemberWhitelister {...{
                    vestingServiceContract: vestingServiceContract,
                    orgName: orgname,
                    isConnectedToAdmin: account?.toLowerCase() == orgInfo?.org?.admin.toLowerCase()
                }} />
                <VestCreator {...{
                    vestingServiceContract: vestingServiceContract,
                    orgName: orgname,
                    isConnectedToAdmin: account?.toLowerCase() == orgInfo?.org?.admin.toLowerCase()
                }} />
                <VestClaimer {...{
                    vestingServiceContract: vestingServiceContract,
                    orgName: orgname
                }} />
            </div>
        </>
    )
}