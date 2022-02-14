import { ArrowBackIcon } from '@chakra-ui/icons';
import { Flex, Heading, Text } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { usePostQuery } from '../../graphql/generated/graphql';
import createUrqlClient from '../../utils/helpers/createUrqlClient';

interface PostProps {}

const Post = ({}: PostProps) => {
  const {
    query: { id },
  } = useRouter();
  const intId = typeof id === 'string' ? parseInt(id) : -1;
  const [{ data, error, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      postId: intId,
    },
  });

  if (error) {
    console.error(error);
  }

  if (fetching) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  }

  return (
    <Layout variant="small" HomeButton={ArrowBackIcon}>
      <Heading>{data?.post?.title}</Heading>
      <Flex>
        <Text mr={'auto'}>
          <i>by {data?.post?.creator.username}</i>
        </Text>
        <Text>{new Date(data?.post?.createdAt).toUTCString()}</Text>
      </Flex>
      <Text mt={9} textAlign={'justify'}>
        {data?.post?.text}
      </Text>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
