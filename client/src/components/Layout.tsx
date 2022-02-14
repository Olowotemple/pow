import { ComponentWithAs, Flex, IconButton, IconProps } from '@chakra-ui/react';
import NextLink from 'next/link';
import { ReactNode } from 'react';
import NavBar from './NavBar';
import Wrapper from './Wrapper';

interface LayoutProps {
  variant?: 'small' | 'regular';
  children: ReactNode;
  HomeButton?: ComponentWithAs<'svg', IconProps>;
}

const Layout = ({ variant = 'small', children, HomeButton }: LayoutProps) => {
  return (
    <>
      <NavBar />
      <Flex ml={400}>
        {HomeButton ? (
          <NextLink href="/">
            <IconButton
              size={'lg'}
              aria-label="Go Home"
              icon={<HomeButton />}
            />
          </NextLink>
        ) : null}
      </Flex>
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  );
};

export default Layout;
