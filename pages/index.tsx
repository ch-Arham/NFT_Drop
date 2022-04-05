import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link';
import { sanityClient, urlFor } from '../sanity.js'
import { Collection } from '../typings';

interface Props {
  collections: Collection[];
}

const Home = ({ collections }: Props) => {
  return (
    <>
      <Head>
        <title>NFT Project</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div  className='max-w-7xl mx-auto flex flex-col min-h-screen mt-2 px-10 2xl:p-0'>
        <h1 className="mb-10 text-4xl font-extralight">The{' '}<span className='font-extrabold underline decoration-pink-600/50'>LeoAldo</span>{' '}NFT Market Place</h1>

        <main className='bg-slate-100 p-10 shadow-xl shadow-rose-400/20 mt-[-15px]'>
          <div className='grid space-x-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'>
            {collections.map((collection,index) => (
              <Link href={`/nft/${ collection.slug.current }`} >
                <div className='flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-105' key={index}>
                  <img className="h-96 w-60 object-cover rounded-2xl" src={urlFor(collection.mainImage).url()} alt="Main Images Of Apes" />

                  <div className='px-5 py-3'>
                    <h2 className="text-3xl">{collection.title}</h2>
                    <p className='mt-3 text-sm text-gray-400'>{collection.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </>
  )
}

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const query = `*[_type == "collection"]{
    _id,title,address,description,
    nftCollectionName,
    mainImage{
    asset
    },
  previewImage{
    asset
  },
  slug{
    current
  },
  creator -> {
    _id,name,address,
    slug{
    current
  },
  },
  }`;

  const collections = await sanityClient.fetch(query);

  return {
    props: {
      collections
    }
  }

};
