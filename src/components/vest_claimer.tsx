import { useState } from "react";
import { VestingService } from "../../typechain-types";

interface Props {
    vestingServiceContract: VestingService | undefined,
    orgName: string
}

export function VestClaimer(props: Props) {

    async function claimVest() {
        if (props.vestingServiceContract)  {
            await props.vestingServiceContract.claimVests(props.orgName)
        }
    }

    function renderStateHtml() {
        if (props.vestingServiceContract) {
            return (
                <>
                <button onClick={claimVest}>
                    Claim
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
            <h3>Vest Claimer</h3>
            {renderStateHtml()}
        </div>
    );
}