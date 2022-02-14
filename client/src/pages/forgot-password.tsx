import { Box, Button } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useState } from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useForgotPasswordMutation } from '../graphql/generated/graphql';
import createUrqlClient from '../utils/helpers/createUrqlClient';

interface ForgotPasswordProps {}

interface InitialValues {
  email: string;
}

const ForgotPassword = ({}: ForgotPasswordProps) => {
  const [complete, setComplete] = useState<boolean>(false);
  const [_result, forgotPassword] = useForgotPasswordMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (
          values: InitialValues,
          _helpers: FormikHelpers<InitialValues>
        ) => {
          await forgotPassword(values);
          setComplete(true);
        }}
      >
        {({ dirty, isValid, isSubmitting }) =>
          complete ? (
            <Box>
              If an account with that email is registered with us, you should
              get an email.
              <br />
              Please check your inbox
            </Box>
          ) : (
            <Form>
              <InputField
                name="email"
                label="Email"
                placeholder="bob@123.com"
                type="email"
              />

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
                Send Email
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
