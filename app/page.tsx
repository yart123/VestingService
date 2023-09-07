'use client'
import { ExternalProvider } from "@ethersproject/providers";
import { useEffect, useState } from 'react';
import { OrgCreator } from "../src/components/org_creator"
import { OrgList } from "../src/components/org_list"
import { WalletConnector } from "../src/components/wallet_connector";
import { VestingService } from "../typechain-types";
import { getVestingServiceContract, loadMainPageInfo } from "../src/helpers/ethers_helper";
import { Organization } from "../src/interfaces/organization";

export default function IndexPage({
}) {
    const [wallet, setWallet] = useState<ExternalProvider|undefined>(undefined);
    const [account, setAccount] = useState<string|undefined>(undefined);
    const [vestingServiceContract, setVSContract] = useState<VestingService|undefined>(undefined);
    const [organizations, setOrgs] = useState<Organization[]|undefined>(undefined);
    
    if (vestingServiceContract && !organizations) {
        loadMainPageInfo(vestingServiceContract, setOrgs)
            .catch(console.error)
    }

    useEffect(() => {
        if (!vestingServiceContract) {
            getVestingServiceContract(setVSContract, async (vestingServiceContract) => { loadMainPageInfo(vestingServiceContract, setOrgs) })
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
                <OrgList {...{
                    organizations: organizations
                }} />
                <OrgCreator {...{
                    vestingServiceContract: vestingServiceContract
                }} />
            </div>
        </>
    )
}