import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useState } from 'react';
import Layout from '../components/Layout';
import Vote from '../components/Vote';
import {
  useDeletePostMutation,
  useMeQuery,
  usePostsQuery,
} from '../graphql/generated/graphql';
import createUrqlClient from '../utils/helpers/createUrqlClient';

const Index = () => {
  const [variables, setVariables] = useState<{
    limit: number;
    cursor: string | null;
  }>({ limit: 10, cursor: null });
  const [{ data: meData }] = useMeQuery();
  const [{ data, error, fetching }, _getPosts] = usePostsQuery({ variables });
  const [_result, deletePost] = useDeletePostMutation();

  if (!fetching && !data) {
    return (
      <Box>
        <div>something went wrong :(</div>
        <div>{error?.message}</div>
      </Box>
    );
  }

  if (fetching) {
    return null;
  }

  return (
    <Layout variant="regular">
      {data && (
        <Stack spacing={8}>
          {data.posts.posts.map((post) =>
            !post ? null : (
              <Flex
                p={5}
                shadow="md"
                borderWidth="1px"
                key={post.title + post.id}
                alignItems={'center'}
                style={{ position: 'relative' }}
              >
                <Vote post={post} />
                <Box>
                  <NextLink href="/post/[id]" as={`/post/${post.id}`}>
                    <Link>
                      <Heading fontSize="xl">
                        {post.title}{' '}
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 'normal',
                            fontStyle: 'italic',
                          }}
                        >
                          by{' '}
                          {post.creator.username === meData?.me?.username
                            ? 'me'
                            : post.creator.username}
                        </span>
                      </Heading>
                    </Link>
                  </NextLink>

                  <Text mt={4}>{post.textSnippet}</Text>
                </Box>
                {meData?.me?.id === post.creator.id ? (
                  <>
                    <NextLink
                      href="/post/edit/[id]"
                      as={`/post/edit/${post.id}`}
                    >
                      <IconButton
                        aria-label="Edit Post"
                        as={Link}
                        icon={<EditIcon />}
                        style={{
                          position: 'absolute',
                          top: '20px',
                          right: '20px',
                          color: 'blue',
                        }}
                      />
                    </NextLink>
                    <IconButton
                      aria-label="Delete Post"
                      icon={<DeleteIcon />}
                      style={{
                        position: 'absolute',
                        bottom: '20px',
                        right: '20px',
                        color: 'red',
                      }}
                      onClick={() => {
                        deletePost({ id: post.id });
                      }}
                    />
                  </>
                ) : null}
              </Flex>
            )
          )}
        </Stack>
      )}

      {data && data.posts.hasMore ? (
        <Flex justifyContent={'center'}>
          <Button
            onClick={() =>
              setVariables({
                limit: variables.limit,
                cursor: String(
                  data.posts.posts[data.posts.posts.length - 1].createdAt
                ),
              })
            }
            isLoading={fetching}
            my={8}
          >
            Load More
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
