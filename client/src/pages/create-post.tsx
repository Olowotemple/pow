import { Box, Button } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import InputField from '../components/InputField';
import Layout from '../components/Layout';
import { useCreatePostMutation } from '../graphql/generated/graphql';
import createUrqlClient from '../utils/helpers/createUrqlClient';
import useIsAuth from '../utils/hooks/useIsAuth';

interface CreatePostProps {}

interface InitialValues {
  title: string;
  text: string;
}

const CreatePost = ({}: CreatePostProps) => {
  const router = useRouter();
  useIsAuth();
  const [_result, createPost] = useCreatePostMutation();

  return (
    <Layout>
      <Formik
        initialValues={{ title: '', text: '' }}
        onSubmit={async (
          values: InitialValues,
          _helpers: FormikHelpers<InitialValues>
        ) => {
          const { error } = await createPost({ input: values });
          if (!error) {
            router.push('/');
          }
        }}
      >
        {({ dirty, isValid, isSubmitting }) => {
          return (
            <Form>
              <InputField name="title" label="Title" placeholder="title" />

              <Box mt={4}>
                <InputField
                  name="text"
                  label="Body"
                  placeholder="text..."
                  textArea
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
                Create Post
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
