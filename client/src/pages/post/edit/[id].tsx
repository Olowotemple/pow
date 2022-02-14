import { Box, Button } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import { withUrqlClient } from 'next-urql';
import router from 'next/router';
import InputField from '../../../components/InputField';
import Layout from '../../../components/Layout';
import { useUpdatePostMutation } from '../../../graphql/generated/graphql';
import createUrqlClient from '../../../utils/helpers/createUrqlClient';
import useGetPostFromId from '../../../utils/hooks/useGetPostFromId';
import useGetPostIdFromUrl from '../../../utils/hooks/useGetPostIdFromUrl';

interface EditPostProps {}

interface InitialValues {
  title: string;
  text: string;
}

const EditPost = ({}: EditPostProps) => {
  const id = useGetPostIdFromUrl();
  const [{ data, fetching }] = useGetPostFromId(id);
  const [_result, updatePost] = useUpdatePostMutation();

  if (fetching) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <div>could not find post</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (
          values: InitialValues,
          _helpers: FormikHelpers<InitialValues>
        ) => {
          await updatePost({
            id,
            title: values.title,
            text: values.text,
          });
          router.push('/');
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
                  style={{ minHeight: 'max-content' }}
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
                Update Post
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);
