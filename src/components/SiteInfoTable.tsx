const siteInfo = [
  { label: "Website", value: "teenpattiapks.com.pk" },
  { label: "Developer", value: "Ahmed" },
  { label: "Category", value: "Teen Patti APKs" },
  { label: "Required OS", value: "Android 5.0+" },
  { label: "Update", value: "6th July 2026" },
  { label: "Downloads", value: "500K+" },
  { label: "Rating Count", value: "200,000+" },
  { label: "Language", value: "English, Urdu" },
  { label: "Price", value: "Free ($0)" },
];

export default function SiteInfoTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800/30">
      <table className="w-full text-xs sm:text-sm">
        <tbody>
          {siteInfo.map((row, index) => (
            <tr
              key={row.label}
              className={index !== siteInfo.length - 1 ? "border-b border-zinc-800" : ""}
            >
              <th className="w-[40%] px-3 py-2.5 text-left font-medium text-zinc-500 sm:w-[42%] sm:px-4 sm:py-3.5">
                {row.label}
              </th>
              <td className="px-3 py-2.5 text-left font-medium text-zinc-200 sm:px-4 sm:py-3.5">
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
