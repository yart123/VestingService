import { useState } from "react";
import { VestingService } from "../../typechain-types";

interface Props {
    vestingServiceContract: VestingService | undefined,
    orgName: string,
    isConnectedToAdmin: boolean
}

export function VestCreator(props: Props) {

    const [memberAddress, setMemberAddress] = useState('');
    const [vestAmount, setVestAmount] = useState(0);
    const [vestAvailableAfter, setVestAvailableAfter] = useState('');

    async function createVest() {
        if (props.vestingServiceContract && props.orgName != '' && memberAddress != '' && vestAmount != 0 && vestAvailableAfter != '')  {
            let vestDate = new Date(vestAvailableAfter)
            let vestTimestamp = vestDate.getTime()/1000
            await props.vestingServiceContract.addVest(props.orgName, memberAddress, vestTimestamp, vestAmount)
            setMemberAddress('')
            setVestAmount(0)
            setVestAvailableAfter('')
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
                    placeholder="Vest Amount"
                    pattern="[0-9]*"
                    value={vestAmount}
                    onChange={(e) => {setVestAmount(e.target.validity.valid && e.target.value != '' ? parseInt(e.target.value) : vestAmount)}} />
                <input
                    type="datetime-local"
                    value={vestAvailableAfter}
                    onChange={(e) => {setVestAvailableAfter(e.target.value)}} />
                <button onClick={createVest}>
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
        <div className="panel member_whitelister">
            <h3>Vest Creator</h3>
            {renderStateHtml()}
        </div>
    );
}