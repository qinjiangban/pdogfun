'use client'

import Link from "next/link"


export default function Page() {

  const faqItems = [
    {
      question: "What is PdogFun?",
      answer: "Designed to simplify the creation of meme coins. Allows anyone to quickly and easily launch their own meme token without deep technical knowledge. Users can create a token by uploading an image, choosing a name and symbol, and paying a small fee. The platform uses a bond curve pricing model, where the token price rises as more people buy it, creating liquidity before listing on decentralized exchanges."
    },
    {
      question: 'Decentralized Exchanges',
      answer: 'Currently, there is no decentralized exchange application on Lens, similar to uinswap. After the Bonding Curve reaches the specified amount, it will join the decentralized exchange liquidity pool.'
    },
    {
      question: 'Token metadata',
      answer: 'Use Lens Storage Node to store the metadata of meme tokens. This data can be obtained from the lens social network, and some metadata can be edited and changed.'
    },
    {
      question: 'Ranking',
      answer: 'Get lens social network content, all posts about meme, and rank them according to social popularity and on-chain transaction data'
    },
    {
      question: 'Token Comment',
      answer: 'Comments for all tokens are obtained from the posts of the lens account about the corresponding meme token. We will explore more ideas of the on-chain community in the future.'
    },
    {
      question: '',
      answer: ''
    }
  ]

  return (
    <div className=" bg-base-200 ">

      {/* Hero Section */}
      <section className="bg-primary py-20">
        <div className="  mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">FQA</h2>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="  mx-auto px-4">
          <div className="max-w-3xl mx-auto ">
            {faqItems.map((item, index) => (
              <div key={index} className="collapse collapse-plus bg-base-100 my-3">
                <input type="radio" name="my-accordion-3" defaultChecked />
                <div className="collapse-title text-xl font-medium">{item.question}</div>
                <div className="collapse-content">
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 ">
        <div className="  mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Still have questions?</h3>
          <p className="text-xl mb-8">We're here to help. Please contact our support team for more information.</p>
          <Link href="" target='_blank' className="inline-block bg-primary text-gray-800 font-semibold px-6 py-3 rounded-full hover:bg-opacity-80 transition duration-300">
            Customer Support
          </Link>
        </div>
      </section>


    </div>
  )
}