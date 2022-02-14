import { Box, Button } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useRegisterMutation } from '../graphql/generated/graphql';
import createUrqlClient from '../utils/helpers/createUrqlClient';
import toErrorMap from '../utils/helpers/toErrorMap';

interface RegisterProps {}

interface InitialValues {
  username: string;
  password: string;
  email: string;
}

const Register = ({}: RegisterProps) => {
  const router = useRouter();
  const [_result, register] = useRegisterMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: '', password: '', email: '' }}
        onSubmit={async (
          values: InitialValues,
          helpers: FormikHelpers<InitialValues>
        ) => {
          const response = await register({ credentials: values });
          if (response.data?.register.errors) {
            helpers.setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            router.push('/');
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

              <InputField name="email" label="Email" placeholder="email" />

              <Box mt={4}>
                <InputField
                  name="password"
                  label="Password"
                  placeholder="password"
                  type="password"
                />
              </Box>

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
                Register
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Register);
