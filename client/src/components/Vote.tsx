import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import { useState } from 'react';
import { PostsQuery, useVoteMutation } from '../graphql/generated/graphql';

interface VoteProps {
  post: PostsQuery['posts']['posts'][0];
}

const Vote = ({ post: { id, points, voteStatus } }: VoteProps) => {
  const [loadingState, setLoadingState] = useState<
    'upvote-loading' | 'downvote-loading' | 'not-loading'
  >('not-loading');
  const [_result, vote] = useVoteMutation();

  return (
    <Flex
      flexDirection={'column'}
      justifyContent="center"
      alignItems={'center'}
      mr={7}
    >
      <IconButton
        aria-label="Upvote post"
        isLoading={loadingState === 'upvote-loading'}
        icon={<ChevronUpIcon />}
        size="md"
        onClick={async () => {
          if (voteStatus === 1) {
            return;
          }
          setLoadingState('upvote-loading');
          await vote({
            postId: id,
            value: 1,
          });
          setLoadingState('not-loading');
        }}
        bgColor={voteStatus === 1 ? 'green.500' : 'gray.200'}
        fontSize="24px"
      />
      {points}
      <IconButton
        aria-label="Downvote post"
        isLoading={loadingState === 'downvote-loading'}
        icon={<ChevronDownIcon />}
        size="md"
        onClick={async () => {
          if (voteStatus === -1) {
            return;
          }
          setLoadingState('downvote-loading');
          await vote({
            postId: id,
            value: -1,
          });
          setLoadingState('not-loading');
        }}
        bgColor={voteStatus === -1 ? 'red.500' : 'gray.200'}
        fontSize="24px"
      />
    </Flex>
  );
};

export default Vote;
