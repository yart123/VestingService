import { Member, Vest } from "../interfaces/organization";

interface Props {
    members: Member[]|undefined
    tokenTicker: string
}

export function MemberList(props: Props) {

    function vestToString(v: Vest) {
        let date = new Date(v.availableAfterTimestamp * 1000)
        let emoji = v.claimed ? "✅" : (date < new Date()? "🤑" : "🔜")
        return `${emoji} ${v.amount} $${props.tokenTicker} available ${date.toDateString()} ${date.toLocaleTimeString()}`
    }

    function displayMembers() {
        if (props.members && props.members.length > 0) {
            return (
                <>
                <div className="member_list_item list_header">
                    <span className="light_span">Role</span>
                    <span className="light_span">Address</span>
                    <span className="heavy_span">Vests</span>
                </div>
                { props.members.map(
                    (member) => {
                        return (
                            <>
                            <div className="member_list_item" key={member.address}>
                                <span className="light_span">{member.role}</span>
                                <span className="light_span">{member.address}</span>
                                <span className="heavy_span"></span>
                            </div>
                            { member.vests.sort((v1,v2) => v1.availableAfterTimestamp - v2.availableAfterTimestamp).map(
                                (vest) => {
                                    return (
                                        <div className="member_list_item" key={vest.availableAfterTimestamp}>
                                            <span className="light_span"></span>
                                            <span className="light_span"></span>
                                            <span className="heavy_span">{vestToString(vest)}</span>
                                        </div>
                                    )
                                }
                            )}
                            </>
                        )
                    }
                )}
                </>
            )
        } else {
            return (
                <h3>No members in this organization yet</h3>
            )
        }
    }

    return (
        <div className="panel member_list">
            <h3>All Members</h3>
            {displayMembers()}
        </div>
    );
}