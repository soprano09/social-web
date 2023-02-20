import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import cloudinary from "../../../utils/cloudinaryConfig";
import { TRPCError } from "@trpc/server";
import { formatError } from "../../../utils/utilityFunctions";

const reusedInclude = {
  user: true,
  _count: {
    select: {
      retweets: true,
      likes: true,
      Bookmark: true,
      comments: true,
    },
  },
};

export const tweetRouter = createTRPCRouter({
  createTweet: protectedProcedure
    .input(
      z.object({
        image: z.string().optional(),
        text: z.string(),
        authorized: z.enum(["PUBLIC", "FOLLOWER"]),
      })
    )
    .mutation(async ({ input, ctx: { prisma, session } }) => {
      try {
        const photoUrl = input.image
          ? await cloudinary.uploader.upload(input.image)
          : undefined;

        const reusedWhere = {
          user: {
            id: session.user.id,
          },
        };

        const newTweet = await prisma.tweet.create({
          data: {
            user: {
              connect: {
                id: session.user.id,
              },
            },
            image: photoUrl?.url,
            imageID: photoUrl?.public_id,
            text: input.text,
            authorized: input.authorized,
          },
          include: {
            ...reusedInclude,
            retweets: {
              where: reusedWhere,
            },
            likes: {
              where: reusedWhere,
            },
            Bookmark: {
              where: reusedWhere,
            },
          },
        });
        return newTweet;
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),

  getTweets: protectedProcedure.query(async ({ ctx: { prisma, session } }) => {
    try {
      return await prisma.$transaction(async (tx) => {
        const followingUser = await tx.user.findUnique({
          where: {
            id: session.user.id,
          },
          select: {
            Following: true,
          },
        });

        const following = followingUser
          ? followingUser.Following.map((f) => f.userId)
          : [];

        const reusedWhere = {
          user: {
            id: session.user.id,
          },
        };

        const tweets = await tx.tweet.findMany({
          where: {
            user: {
              id: {
                in: [session.user.id, ...following],
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            ...reusedInclude,
            retweets: {
              where: reusedWhere,
            },
            likes: {
              where: reusedWhere,
            },
            Bookmark: {
              where: reusedWhere,
            },
          },
        });
        return tweets;
      });
    } catch (err) {
      console.log(err);
      throw new TRPCError(formatError(err));
    }
  }),

  deleteTweet: protectedProcedure
    .input(z.object({ tweetID: z.string(), imageID: z.string().optional() }))
    .mutation(async ({ ctx: { prisma }, input: { tweetID, imageID } }) => {
      try {
        imageID && (await cloudinary.uploader.destroy(imageID));

        const tweet = await prisma.tweet.delete({
          where: {
            id: tweetID,
          },
        });

        return tweet;
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),

  likeTweet: protectedProcedure
    .input(
      z.object({
        likeID: z.string().optional(),
        twitterID: z.string(),
      })
    )
    .mutation(
      async ({ ctx: { prisma, session }, input: { likeID, twitterID } }) => {
        try {
          if (likeID) {
            const deletedLike = await prisma.tweetLike.delete({
              where: {
                id: likeID,
              },
            });

            return deletedLike;
          }

          const likedTweet = await prisma.tweetLike.create({
            data: {
              user: {
                connect: {
                  id: session.user.id,
                },
              },
              Tweet: {
                connect: {
                  id: twitterID,
                },
              },
            },
          });

          return likedTweet;
        } catch (err) {
          console.log(err);
          throw new TRPCError(formatError(err));
        }
      }
    ),

  bookmarkTweet: protectedProcedure
    .input(
      z.object({
        bookmarkID: z.string().optional(),
        twitterID: z.string(),
      })
    )
    .mutation(
      async ({
        ctx: { session, prisma },
        input: { bookmarkID, twitterID },
      }) => {
        try {
          if (bookmarkID) {
            const deletedBookmark = await prisma.bookmark.delete({
              where: {
                id: bookmarkID,
              },
            });

            return deletedBookmark;
          }

          const bookmarkedTweet = await prisma.bookmark.create({
            data: {
              user: {
                connect: {
                  id: session.user.id,
                },
              },
              Tweet: {
                connect: {
                  id: twitterID,
                },
              },
            },
          });

          return bookmarkedTweet;
        } catch (err) {
          console.log(err);
          throw new TRPCError(formatError(err));
        }
      }
    ),
  retweetTweet: protectedProcedure
    .input(
      z.object({
        retweetID: z.string().optional(),
        twitterID: z.string(),
      })
    )
    .mutation(
      async ({ ctx: { session, prisma }, input: { retweetID, twitterID } }) => {
        try {
          if (retweetID) {
            const deletedRetweet = await prisma.retweet.delete({
              where: {
                id: retweetID,
              },
            });

            return deletedRetweet;
          }

          const retweetedTweet = await prisma.retweet.create({
            data: {
              user: {
                connect: {
                  id: session.user.id,
                },
              },
              Tweet: {
                connect: {
                  id: twitterID,
                },
              },
            },
          });

          return retweetedTweet;
        } catch (err) {
          console.log(err);
          throw new TRPCError(formatError(err));
        }
      }
    ),
});