import { useRouter } from 'next/router';

const useGetPostIdFromUrl = () => {
  const {
    query: { id },
  } = useRouter();

  return typeof id === 'string' ? parseInt(id) : -1;
};

export default useGetPostIdFromUrl;
