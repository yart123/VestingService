import { Dispatch, SetStateAction, useEffect } from 'react';
import { getWallet, getAccount, connectAccount } from '../helpers/ethers_helper';
import { ExternalProvider } from "@ethersproject/providers";

interface WalletConnectorProps {
    wallet: ExternalProvider|undefined,
    account: string|undefined,
    setWallet: Dispatch<SetStateAction<ExternalProvider | undefined>>,
    setAccount: Dispatch<SetStateAction<string | undefined>>
}

export function WalletConnector(props: WalletConnectorProps) {

    useEffect(() => { 
        const loadWeb3 = async () => {
            props.setWallet(getWallet());
            if (getWallet()) {
                props.setAccount(await getAccount())
            }
        }
        loadWeb3()
            .catch(console.error)
    }, []);

    const connectToWallet = async () => {
        props.setAccount(await connectAccount())
    }

    if (!props.wallet) {
        return (
            <h4>No wallet detected! Install a web3 wallet then come back.</h4>
        );
    }
    if (props.account) {
        return (
            <h4>Connected to wallet {props.account}</h4>
        );
    } else {
        return (
            <button onClick={connectToWallet}>Connect Wallet</button>
        );
    }
}