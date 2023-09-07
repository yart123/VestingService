import { Organization } from "../interfaces/organization";

interface Props {
    organization: Organization|undefined
}

export function OrgDisplayer(props: Props) {

    function displayOrg() {
        if (props.organization) {
            return (
                <>
                <div>
                    <div className="org_displayer_header">
                        <div>Name</div>
                        <div>Token Name</div>
                        <div>Token Ticker</div>
                        <div>Token Address</div>
                        <div>Admin Address</div>
                    </div>
                    <div className="org_displayer_data">
                        <div>{props.organization.name}</div>
                        <div>{props.organization.tokenName}</div>
                        <div>{props.organization.tokenTicker}</div>
                        <div>{props.organization.token}</div>
                        <div>{props.organization.admin}</div>
                    </div>
                </div>
                </>
            )
        } else {
            return (
                <h3>Organization does not exist</h3>
            )
        }
    }

    return (
        <div className="panel org_displayer">
            <h3>Organization Information</h3>
            {displayOrg()}
        </div>
    );
}