// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  const tokenId = req.query.tokenId;
  const name = `California Jacuzzi #${tokenId}`;
  const description = `California jacuzzi NFT is a collection for fuckers in Cj`;
  const image = `https://raw.githubusercontent.com/ayofimihan/cjnft/master/frontend/public/${(
    tokenId
  )}.png`;

  return res.status(200).json({
    name: name,
    description: description,
    image: image
  });
}
