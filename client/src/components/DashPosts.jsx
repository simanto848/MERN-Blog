import { Table } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function DashPosts() {
  const currentUser = useSelector((state) => state.user);
  const [userPosts, setUserPosts] = useState([]);
  console.log("User Post", userPosts);

  useEffect(() => {
    if (!currentUser.currentUser.isAdmin) {
      window.location.href = "/dashboard?tab=profile";
    }
    const fetchPosts = async () => {
      try {
        const res = await fetch(
          `/api/post/getposts?userId=${currentUser.currentUser.id}`
        );
        const data = await res.json();
        if (res.ok) {
          setUserPosts(data);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (currentUser.currentUser.isAdmin) {
      fetchPosts();
    }
  }, [currentUser.currentUser.id]);

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-track-slate-500">
      {currentUser.currentUser.isAdmin && userPosts.length > 0 ? (
        <>
          <Table className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date Updated</Table.HeadCell>
              <Table.HeadCell>Post image</Table.HeadCell>
              <Table.HeadCell>Post title</Table.HeadCell>
              <Table.HeadCell>Category</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
              <Table.HeadCell>
                <span>Edit</span>
              </Table.HeadCell>
            </Table.Head>
            {userPosts.map((post) => (
              <Table.Body key={post.id} className="divide-y">
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    {new Date(post.updated_at).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <Link to={`/post/${post.slug}`}>
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-20 h-10 object-cover bg-gray-500"
                      />
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      className="font-medium text-gray-900 dark:text-white"
                      to={`/post/${post.slug}`}
                    >
                      {post.title}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{post.category}</Table.Cell>
                  <Table.Cell>
                    <span className="font-medium text-red-500 hover:underline cursor-pointer">
                      Delete
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      className="text-teal-500 hover:underline cursor-pointer"
                      to={`/update-post/${post.id}`}
                    >
                      <span>Edit</span>
                    </Link>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
        </>
      ) : (
        <p>You have no post yet!</p>
      )}
    </div>
  );
}
