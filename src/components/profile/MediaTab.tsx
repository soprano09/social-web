import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useQueryClient } from "@tanstack/react-query";
import { Session } from "next-auth";
import { api } from "../../utils/api";
import { Spinner } from "flowbite-react";
import Tweet from "../layout/Tweet";
import { getQueryKey } from "@trpc/react-query";
import NoTweet from "../home/NoTweet";

interface Props {
  profileUserId: string;
  isCurrentUser: boolean;
  userSession: Session;
}

export default function MediaTab({
  profileUserId,
  isCurrentUser,
  userSession,
}: Props) {
  const { data: tweets, isLoading: tweetsLoading } =
    api.user.userMedia.useQuery(
      {
        userID: profileUserId,
      },
      { enabled: isCurrentUser, refetchOnMount: true }
    );
  const [parent] = useAutoAnimate();
  const queryClient = useQueryClient();

  return (
    <ul ref={parent} className="space-y-7 md:col-span-3">
      {tweetsLoading ? (
        <div className="mt-6 flex justify-center">
          <Spinner size="lg" aria-label="Default status example" />
        </div>
      ) : tweets && tweets.length ? (
        tweets.map((t) => (
          <Tweet
            key={t.id}
            tweet={t}
            userSession={userSession}
            queryClient={queryClient}
            dataKey={getQueryKey(
              api.user.userMedia,
              { userID: profileUserId },
              "query"
            )}
          />
        ))
      ) : (
        <NoTweet />
      )}
    </ul>
  );
}
