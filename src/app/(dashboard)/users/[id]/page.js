import UserDetailsCard from "@/components/userDetails/UserDetailsCard";
import UserProfileHeader from "@/components/userDetails/UserProfileHeader";
import userDetails from "@/data/userDetails";


export default async function UserDetailsPage({ params }) {

    const { id } = await params;

    const user = userDetails.find(
        item => item.id === Number(id)
    );

    if (!user) {

        return (
            <div className="rounded-xl border border-border bg-surface p-10 text-center">
                User not found.
            </div>
        );
    }

    return (
        <div className="space-y-6">

            <UserProfileHeader user={user} />

            <UserDetailsCard user={user} />

        </div>
    );

}