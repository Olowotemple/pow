import { usePostQuery } from '../../graphql/generated/graphql';

const useGetPostFromId = (id: number) => {
  return usePostQuery({
    pause: id === -1,
    variables: {
      postId: id,
    },
  });
};

export default useGetPostFromId;
