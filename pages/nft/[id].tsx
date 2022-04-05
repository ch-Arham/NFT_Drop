import React, { useEffect, useState } from 'react'
import { useAddress, useDisconnect, useMetamask, useNFTDrop } from "@thirdweb-dev/react";
import { GetServerSideProps } from 'next';
import { sanityClient, urlFor } from '../../sanity';
import { Collection } from '../../typings';
import Link from 'next/link';
import { BigNumber } from 'ethers';
import toast, { Toaster } from 'react-hot-toast';

interface Props {
    collection: Collection
}

const NFTDropPage = ({collection}:Props) => {

  const [ claimedSupply, setClaimedSupply ] = useState<number>(0);
  const [ totalSupply, setTotalSupply ] = useState<BigNumber>();
  const [ priceInEth, setPriceInEth ] = useState<string>();
  const [ loading, setLoading ] = useState<boolean>(true);

  const nftDrop = useNFTDrop(collection.address);

  const connectWithMetamask = useMetamask();
  const address = useAddress();
  const disconnect = useDisconnect();

  useEffect(()=>{
    if(!nftDrop) return;

    const fetchPrice = async () => {
        const claimedConditions = await nftDrop.claimConditions.getAll();
        setPriceInEth(claimedConditions?.[0].currencyMetadata.displayValue);
    }

    fetchPrice();

  },[nftDrop]);

  useEffect(()=>{
    if(!nftDrop) return;

    const fetchNFTDropData = async () => {
        setLoading(true);
        const claimed = await nftDrop.getAllClaimed();
        const total = await nftDrop.totalSupply();
  
        setClaimedSupply(claimed.length);
        setTotalSupply(total);
        setLoading(false);
    }


    fetchNFTDropData();

  },[nftDrop]);

  const mintNft = () => {
      if(!nftDrop || !address) return;

      const quantity = 1; // How many unique NFTs you want to claim
    
      setLoading(true);

      const notification = toast.loading('Minting...',{
          style: {
              background: 'white',
              color: 'green',
              fontWeight: 'bolder',
              fontSize: '17px',
              padding: '20px'
          }
      });

      nftDrop.claimTo(address, quantity)
      .then(async (tx) => {
          const receipt = tx[0].receipt // the transaction reciept
          const claimedTokenId = tx[0].id // the id of the NFT claimed
          const claimedNFT = await tx[0].data() // {optional} get the claimed NFT metadata

          toast('You Successfully Minted', {
              duration: 5000,
              style: {
                background: 'green',
                color: 'white',
                fontWeight: 'bolder',
                fontSize: '17px',
                padding: '20px'
            }
          });

          console.log(receipt)
          console.log(claimedTokenId)
          console.log(claimedNFT)
      })
      .catch(err => {
          console.log(err)
          toast('Something Went Wrong', {
            style: {
                background: 'red',
                color: 'white',
                fontWeight: 'bolder',
                fontSize: '17px',
                padding: '20px'
            }
          })
      })
      .finally(()=>{
        setLoading(false);
        toast.dismiss(notification);
      })
  }

  return (
    <div className='flex h-screen flex-col lg:grid lg:grid-cols-10'>
        <Toaster position='bottom-center' />
        <div className="lg:col-span-4 flex flex-col items-center justify-center py-2 lg:min-h-screen bg-gradient-to-br from-cyan-800 to-rose-500 ">
            <div className='bg-gradient-to-br from-yellow-400 to-purple-600 p-2 rounded-xl'>
            <img 
                src={urlFor(collection.previewImage).url()}
                alt="Ape Image"
                className="rounded-xl w-44 lg:h-96 lg:w-72 object-cover"
            />
            </div>
            <div className='text-center p-5 space-y-2'>
                <h1 className="text-4xl text-white font-bold">{collection.nftCollectionName}</h1>
                <h2 className='text-xl text-gray-300'>{collection.description}</h2>
            </div> 
        </div>

        <div className='px-12 py-8 flex flex-col flex-1 lg:col-span-6'>
            <header className="flex items-center justify-between">
                
                <Link href={`/`}>
                <h1 className="w-57 cursor-pointer text-lg sm:text-xl font-extralight sm:w-80">The{' '}<span className='font-extrabold underline decoration-pink-600/50'>LeoAldo</span>{' '}NFT Market Place</h1>
                </Link>
                <button className='bg-rose-500/90 rounded-full px-4 py-2 text-white text-xs font-bold  lg:text-base' 
                onClick={()=>{address ? disconnect() : connectWithMetamask()}}>{address ? 'Sign Out' : 'Sign in'}</button>
                    
                
            </header>

            <hr className='my-2 border' />

            {address && (
                <p className="text-center text-sm text-rose-500">You're logged in with wallet {address.substring(0,5)}...{address.substring(address.length - 5)}</p>
            )}

            <div className='flex flex-col text-center items-center mt-10 space-y-6 flex-1 lg:space-y-0'>
                <img src={urlFor(collection.mainImage).url()} alt="Ape Image" className='w-80 object-cover pb-10 lg:h-40' />
                <h1 className="text-3xl font-bold lg:text-5xl lg:font-extrabold">{collection.title}</h1>

                {loading ? (
                    <p className='pt-2 text-xl text-green-500 animate-pulse lg:pt-5'>Loading Supply Count ...</p>
                ) : (
                    <p className='pt-2 text-xl text-green-500 lg:pt-5'>{claimedSupply} / {totalSupply?.toString()} NFT's claimed</p>
                )}
                
                <div className='w-full h-35 flex justify-center'>
                {loading && (
                    <img className='h-35 w-40 object-contain' src="https://cdn.hackernoon.com/images/0*4Gzjgh9Y7Gu8KEtZ.gif" alt="loader" />
                )}
                </div>
            </div>

            <button onClick={mintNft} disabled={loading || claimedSupply === totalSupply?.toNumber() || !address} className='cursor-pointer h-12 w-full bg-rose-500 text-white rounded-full mt-10 font-bold disabled:bg-gray-400'>
                {loading ? (
                    <>Loading</>
                ) : claimedSupply === totalSupply?.toNumber() ? (
                    <>SOLD OUT</>
                ) : !address ? (
                    <>Sign in to Mint</>
                ) : (
                    <span className='font-bold'>Mint NFT ({priceInEth} ETH)</span>
                )}
            </button>

        </div>
    </div>
  )
} 

export default NFTDropPage;

export const getServerSideProps: GetServerSideProps = async ({params}) => {
    const query = `*[_type == "collection" && slug.current == $id][0]{
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

      const collection = await sanityClient.fetch(query, {
          id: params?.id
      });

      if(!collection){
          return {
              notFound: true
          }
      }

      return {
        props: {
          collection
        }
      }

}