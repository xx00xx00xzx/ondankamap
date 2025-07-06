import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約',
  description: '東京温暖化グラフの利用規約。気象庁データの利用条件、免責事項、プライバシーポリシーについて説明しています。',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            利用規約
          </h1>
          <p className="text-lg text-gray-600">
            東京温暖化グラフサービスの利用規約
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 space-y-8">
          
          {/* 第1条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
              第1条（適用範囲）
            </h2>
            <p className="text-gray-700 leading-relaxed">
              本利用規約（以下「本規約」）は、当サイト「東京温暖化グラフ」（https://ondankamap.vercel.app、以下「本サービス」）の利用条件を定めるものです。利用者（以下「ユーザー」）は、本サービスを利用することにより、本規約に同意したものとみなします。
            </p>
          </section>

          {/* 第2条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
              第2条（サービス内容）
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              本サービスは、以下の機能を提供します：
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>東京の気温データ（1880年〜2024年）の可視化</li>
              <li>猛暑日・真夏日・熱帯夜の年次推移分析</li>
              <li>年別気温比較機能</li>
              <li>現在の天気予報と過去データの比較</li>
              <li>気温関連の各種統計情報の表示</li>
            </ul>
          </section>

          {/* 第3条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
              第3条（データソースと免責事項）
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-yellow-800 mb-2">重要な免責事項</h3>
              <p className="text-yellow-700 text-sm leading-relaxed">
                本サービスで提供される気温データは、気象庁ホームページ（https://www.data.jma.go.jp/obd/stats/etrn/index.php）を加工して作成していますが、データの正確性、完全性、最新性について一切保証いたしません。
              </p>
            </div>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                <strong>3.1 データソース</strong><br />
                本サービスで使用している気温データは、気象庁が公開している過去の気象データを元に作成されています。
              </p>
              <p className="leading-relaxed">
                <strong>3.2 データの制限</strong><br />
                当サイトは以下について一切の責任を負いません：
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>データの正確性、信頼性、完全性</li>
                <li>データの更新頻度や最新性</li>
                <li>データ処理過程で生じた誤差や欠損</li>
                <li>気象庁の元データに含まれる可能性のある誤り</li>
                <li>サービスの中断や停止</li>
              </ul>
              <p className="leading-relaxed">
                <strong>3.3 利用上の注意</strong><br />
                本サービスのデータは参考情報として提供されており、学術研究、業務上の重要な判断、緊急時の対応等には使用しないでください。正確なデータが必要な場合は、気象庁の公式データを直接ご確認ください。
              </p>
            </div>
          </section>

          {/* 第4条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
              第4条（利用制限）
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              ユーザーは、以下の行為を行ってはなりません：
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>本サービスの運営を妨害する行為</li>
              <li>他のユーザーや第三者に迷惑をかける行為</li>
              <li>本サービスの情報を商業目的で無断使用する行為</li>
              <li>本サービスのデータを改ざんまたは不正に取得する行為</li>
              <li>法令に違反する行為</li>
            </ul>
          </section>

          {/* 第5条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
              第5条（知的財産権）
            </h2>
            <p className="text-gray-700 leading-relaxed">
              本サービスのコンテンツ（気象庁データを除く）の著作権、その他の知的財産権は、当サイト運営者に帰属します。ただし、気象庁データの著作権は気象庁に帰属し、その利用については気象庁の利用規約に従います。
            </p>
          </section>

          {/* 第6条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
              第6条（プライバシー）
            </h2>
            <p className="text-gray-700 leading-relaxed">
              本サービスでは、個人を特定できる情報の収集は行っておりません。アクセス解析のため、IPアドレス、アクセス時刻、閲覧ページなどの情報を収集する場合がありますが、これらの情報は統計的な分析にのみ使用し、個人を特定する目的では使用いたしません。
            </p>
          </section>

          {/* 第7条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
              第7条（免責事項）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                <strong>7.1 一般的免責</strong><br />
                当サイト運営者は、本サービスの利用によってユーザーに生じた損害について、一切の責任を負いません。
              </p>
              <p className="leading-relaxed">
                <strong>7.2 間接損害の免責</strong><br />
                本サービスの利用に関連して生じた間接的、付随的、特別な損害（データの消失、事業の中断、利益の逸失等）について、当サイト運営者は一切の責任を負いません。
              </p>
              <p className="leading-relaxed">
                <strong>7.3 第三者サービス</strong><br />
                本サービスで使用している外部API（天気予報サービス等）の利用に関する問題について、当サイト運営者は責任を負いません。
              </p>
            </div>
          </section>

          {/* 第8条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
              第8条（規約の変更）
            </h2>
            <p className="text-gray-700 leading-relaxed">
              当サイト運営者は、必要に応じて本規約を変更することができます。変更後の規約は、本サービス上に掲載した時点で効力を生じるものとします。
            </p>
          </section>

          {/* 第9条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
              第9条（準拠法・管轄裁判所）
            </h2>
            <p className="text-gray-700 leading-relaxed">
              本規約は日本法に準拠し、本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>

          {/* 施行日 */}
          <section className="border-t border-gray-200 pt-6">
            <p className="text-center text-gray-600">
              制定日：2024年12月28日<br />
              最終更新：2024年12月28日
            </p>
          </section>

          {/* 参考リンク */}
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-800 mb-2">参考リンク</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>
                <a href="https://www.data.jma.go.jp/obd/stats/etrn/index.php" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="underline hover:text-blue-900">
                  気象庁 | 過去の気象データ・ダウンロード
                </a>
              </li>
              <li>
                <a href="https://www.jma.go.jp/jma/kishou/info/coment.html" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="underline hover:text-blue-900">
                  気象庁ホームページについて
                </a>
              </li>
            </ul>
          </section>

          {/* 戻るリンク */}
          <div className="text-center pt-6">
            <a href="/" className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
              トップページに戻る
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}