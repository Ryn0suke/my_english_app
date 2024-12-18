import React, { useContext } from 'react';
import { AuthContext } from 'App';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { isSignedIn, currentUser } = useContext(AuthContext);

  return (
    <>
      {
        isSignedIn && currentUser ? (
          <>
            <style>
              {`
                h1 {
                  font-size: 50px;
                }
                a {
                  color: black;
                  text-decoration: none;
                }
                a:visited {
                  color: black;
                }
                div {
                  padding-bottom: 10px;
                }
              `}
            </style>
            <div>
              <h1>英単語学習アプリ</h1>              
              <h2>以下の機能があります</h2>
              <ul>
                <li><h2><Link to='/phrases'>フレーズ登録機能</Link></h2></li>
                <p>日本語と英語のフレーズの組を記録します。フレーズごとにチェック状態やタグをつけることができます。</p>
                <li><h2><Link to='/search'>検索機能</Link></h2></li>
                <p>DMM英会話のサイトから、日本語のフレーズに対応する英語のフレーズをスクレイピングします。</p>
                <p>気に入ったフレーズがあればすぐに登録できます。</p>
                <li><h2><Link to='test'>テスト機能</Link></h2></li>
                <p>登録した単語から問題を出すことができます。</p>
              </ul>
            </div>
            <div>
                <h2>技術スタック</h2>
                <img src='/teck_stack.png' alt='Logo'></img>
                <h2>GitHub</h2>
                <a href='https://github.com/Ryn0suke' target='_blank' rel='noopener noreferrer'><img src='/github-mark.png' width='60px' height="60px"></img></a>

            </div>
          </>
        ) : (
          <h1>サインインしていません</h1>
        )
      }
    </>
  )
}

export default Home;
