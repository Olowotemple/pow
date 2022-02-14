import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useLoginMutation } from '../graphql/generated/graphql';
import createUrqlClient from '../utils/helpers/createUrqlClient';
import toErrorMap from '../utils/helpers/toErrorMap';

interface LoginProps {}

interface InitialValues {
  username: string;
  password: string;
}

const Login = ({}: LoginProps) => {
  const router = useRouter();
  const [_result, login] = useLoginMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (
          { username, password }: InitialValues,
          helpers: FormikHelpers<InitialValues>
        ) => {
          const response = await login({
            username,
            password,
          });
          if (response.data?.login.errors) {
            helpers.setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            if (typeof router.query.next === 'string') {
              router.push(router.query.next);
            } else {
              router.push('/');
            }
          }
        }}
      >
        {({ dirty, isValid, isSubmitting }) => {
          return (
            <Form>
              <InputField
                name="username"
                label="Username"
                placeholder="username"
              />

              <Box mt={4}>
                <InputField
                  name="password"
                  label="Password"
                  placeholder="password"
                  type="password"
                />
              </Box>

              <Flex justifyContent={'flex-end'}>
                <NextLink href="/forgot-password">
                  <Link>forgot password?</Link>
                </NextLink>
              </Flex>

              <Button
                type="submit"
                colorScheme="teal"
                variant="solid"
                mt={4}
                isLoading={isSubmitting}
                loadingText="Submitting"
                spinnerPlacement="start"
                isDisabled={!dirty && isValid}
              >
                Login
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
