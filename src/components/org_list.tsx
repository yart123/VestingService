import Link from "next/link";
import { Organization } from "../interfaces/organization";

interface Props {
    organizations: Organization[]|undefined
}

export function OrgList(props: Props) {

    function displayOrgs() {
        if (props.organizations && props.organizations.length > 0) {
            return (
                <>
                <div className="org_list_item list_header">
                    <span>Name</span>
                    <span>Token Name</span>
                    <span>Token Address</span>
                </div>
                { props.organizations.map(
                    (org) => {
                        return (
                            <Link href={`/org/${org.name}`}>
                            <div className="org_list_item" key={org.name}>
                                <span>{org.name}</span>
                                <span>{org.tokenName}</span>
                                <span>{org.token}</span>
                            </div>
                            </Link>
                        )
                    }
                )}
                </>
            )
        } else {
            return (
                <h3>No organizations created yet</h3>
            )
        }
    }

    return (
        <div className="panel org_list">
            <h3>All Organizations</h3>
            {displayOrgs()}
        </div>
    );
}