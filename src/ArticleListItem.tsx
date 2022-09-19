function ArticleListItem({
  rank,
  name,
  views,
}: {
  rank: number;
  name: string;
  views: number;
}) {
  return (
    <li className="flex justify-between align-baseline space-x-4 border border-gray-300 shadow p-4 rounded">
      <div>
        <div className="text-gray-500 mb-1">Rank {rank}</div>
        <div className="text-2xl">{name}</div>
      </div>
      <div>
        Views:
        <br />
        {views}
      </div>
    </li>
  );
}

export default ArticleListItem;
