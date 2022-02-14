import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../graphql/generated/graphql';
import { isServer } from '../utils/constants';
import { useRouter } from 'next/router';

interface NavBarProps {}

const NavBar = ({}: NavBarProps) => {
  const router = useRouter();
  const [{ data, fetching }, _getMe] = useMeQuery({
    pause: isServer(),
  });
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  let body = null;

  if (fetching) {
  } else if (!data?.me) {
    body = (
      <Flex alignItems={'baseline'} justifyContent={'center'}>
        <NextLink href="/login">
          <Link color="white" mr={3}>
            Login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link color="white">Register</Link>
        </NextLink>
      </Flex>
    );
  } else {
    body = (
      <Flex alignItems={'center'}>
        <Box mr={4}>{data.me.username}</Box>
        <NextLink href="/create-post">
          <Button as={Link} mr={4}>
            Create Post
          </Button>
        </NextLink>
        <Button
          variant="link"
          onClick={async () => {
            await logout();
            router.reload();
          }}
          isLoading={logoutFetching}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex
      justifyContent={'center'}
      bg="tomato"
      p={4}
      mb={15}
      position="sticky"
      top={0}
      zIndex={1}
    >
      <Flex width={'60%'} alignItems={'center'}>
        <Box mr="auto">
          <NextLink href="/">
            <Link>
              <Heading>Pow</Heading>
            </Link>
          </NextLink>
        </Box>
        {body}
      </Flex>
    </Flex>
  );
};

export default NavBar;
