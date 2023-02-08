import { Navbar, Dropdown, Avatar, Button } from "flowbite-react";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";

interface Props {
  setToggleModal: Dispatch<SetStateAction<boolean>>;
}

export default function AppHeader({ setToggleModal }: Props) {
  return (
    <header className="AppHeader w-full bg-white">
      <Navbar fluid={true} className="mx-auto max-w-[90rem]">
        <Link href="/">
          <img
            src="/images/tweeter.svg"
            className="h-6 sm:h-9"
            alt="app Logo"
          />
        </Link>
        <div className="flex md:order-2">
          <Dropdown
            arrowIcon={false}
            inline={true}
            label={
              <Avatar
                alt="User settings"
                img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                rounded={true}
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">Bonnie Green</span>
              <span className="block truncate text-sm font-medium">
                name@flowbite.com
              </span>
            </Dropdown.Header>
            <Link href="/profile">
              <Dropdown.Item>Profile</Dropdown.Item>
            </Link>
            <Dropdown.Item>Settings</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item>Sign out</Dropdown.Item>
          </Dropdown>
          {/* <Button onClick={() => setToggleModal(true)}>Login</Button> */}
          <Navbar.Toggle />
        </div>
        <Navbar.Collapse>
          <Link href="/">
            <span className="cursor-pointer text-sm text-gray-700 hover:text-blue-500">
              Home
            </span>
          </Link>
          <Link href="/explore">
            <span className="cursor-pointer text-sm text-gray-700 hover:text-blue-500">
              Explore
            </span>
          </Link>
          <Link href="/bookmarks">
            <span className="cursor-pointer text-sm text-gray-700 hover:text-blue-500">
              Bookmarks
            </span>
          </Link>
        </Navbar.Collapse>
      </Navbar>
    </header>
  );
}
