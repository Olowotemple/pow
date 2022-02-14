import { ArrowForwardIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import InputField from '../../components/InputField';
import Wrapper from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../graphql/generated/graphql';
import createUrqlClient from '../../utils/helpers/createUrqlClient';
import toErrorMap from '../../utils/helpers/toErrorMap';

interface InitialValues {
  newPassword: string;
}

const ChangePassword = () => {
  const router = useRouter();
  const [_result, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState('');
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: '' }}
        onSubmit={async (
          { newPassword }: InitialValues,
          helpers: FormikHelpers<InitialValues>
        ) => {
          const response = await changePassword({
            newPassword,
            token:
              typeof router.query.token === 'string' ? router.query.token : '',
          });
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);

            if ('token' in errorMap) {
              setTokenError(errorMap.token);
            }
            helpers.setErrors(errorMap);
          } else if (response.data?.changePassword.user) {
            router.push('/');
          }
        }}
      >
        {({ dirty, isValid, isSubmitting }) => {
          return (
            <Form>
              <InputField
                name="newPassword"
                label="New Password"
                placeholder="new password"
                type="password"
              />
              {tokenError ? (
                <Flex>
                  <Box color="red" mr="auto">
                    {tokenError}
                  </Box>
                  <NextLink href="/forgot-password">
                    <Link>
                      go forget it again <ArrowForwardIcon />{' '}
                    </Link>
                  </NextLink>
                </Flex>
              ) : null}
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
                Change Password
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
