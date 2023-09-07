import { useState } from "react";
import { VestingService } from "../../typechain-types";

interface Props {
    vestingServiceContract: VestingService | undefined,
    orgName: string,
    isConnectedToAdmin: boolean
}

export function MemberWhitelister(props: Props) {

    const [memberAddress, setMemberAddress] = useState('');
    const [memberRole, setMemberRole] = useState('');

    async function whitelistMember() {
        if (props.vestingServiceContract && props.orgName != '' && memberRole != '' && memberAddress != '')  {
            await props.vestingServiceContract.whitelistMember(props.orgName, memberRole.trim(), memberAddress.trim())
            setMemberAddress('')
            setMemberRole('')
        }
    }

    function renderStateHtml() {
        if (!props.isConnectedToAdmin) {
            return (
                <h4>You are not admin</h4>
            )
        }
        if (props.vestingServiceContract) {
            return (
                <>
                <input
                    placeholder="Paste 0x12..90"
                    pattern="^0x[a-fA-F0-9]{40}$"
                    value={memberAddress}
                    onChange={(e) => {setMemberAddress(e.target.validity.valid ? e.target.value : '')}} />
                <input
                    placeholder="Founder"
                    value={memberRole}
                    onChange={(e) => {setMemberRole(e.currentTarget.value)}} />
                <button onClick={whitelistMember}>
                    Whitelist
                </button>
                </>
            )
        }
        return (
            <h4>Loading contract...</h4>
        )
    }

    return (
        <div className="panel member_whitelister">
            <h3>Whitelist Member</h3>
            {renderStateHtml()}
        </div>
    );
}