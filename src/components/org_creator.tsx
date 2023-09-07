import { useState } from "react";
import { VestingService } from "../../typechain-types";

interface Props {
    vestingServiceContract: VestingService | undefined
}

export function OrgCreator(props: Props) {

    const [orgName, setOrgName] = useState('');
    const [tokenName, setTokenName] = useState('');
    const [tokenTicker, setTokenTicker] = useState('');
    const [decimals, setDecimals] = useState(0);

    async function createOrg() {
        if (props.vestingServiceContract && orgName != '' && tokenName != '' && tokenTicker != '')  {
            await props.vestingServiceContract.registerOrganization(orgName.trim(), tokenName.trim(), tokenTicker, decimals)
            setOrgName('')
            setTokenName('')
            setTokenTicker('')
            setDecimals(0)
        }
    }

    function renderStateHtml() {
        if (props.vestingServiceContract) {
            return (
                <>
                <input
                    placeholder="XYZ Corporation"
                    value={orgName}
                    onChange={(e) => {setOrgName(e.currentTarget.value)}} />
                <input
                    placeholder="Xyzrium"
                    value={tokenName}
                    onChange={(e) => {setTokenName(e.currentTarget.value)}} />
                <input
                    placeholder="XYZ"
                    value={tokenTicker}
                    onChange={(e) => {setTokenTicker(e.currentTarget.value.toUpperCase().trim())}} />
                <input
                    placeholder="XYZ Corporation"
                    pattern="[0-9]*"
                    value={decimals}
                    onChange={(e) => {setDecimals(e.target.validity.valid && e.target.value != '' ? parseInt(e.target.value) : decimals)}} />
                <button onClick={createOrg}>
                    Create
                </button>
                </>
            )
        } else {
            return (
                <h4>Loading contract...</h4>
            )
        }
    }

    
    return (
        <div className="panel org_creator">
            <h3>Create Org</h3>
            {renderStateHtml()}
        </div>
    );
}