import { Phrase } from 'interfaces';
import { VolumeUp } from '@mui/icons-material';
import soundUp from 'components/utils/Sound';
import React from 'react';

interface Props {
    Phrases: Phrase[];
    currentQuestion: number;
    isJapaneseToEnglish: boolean;
    isAnswer: boolean;
}

const Question: React.FC<Props> = ({ Phrases, currentQuestion, isJapaneseToEnglish, isAnswer }) => {

    if (Phrases.length === 0) {
        return <h3 style={styles.centered}>出題設定を行ってください</h3>;
    }

    // currentQuestion が Phrases 配列の範囲内かをチェック
    if (currentQuestion < 0 || currentQuestion >= Phrases.length) {
        return <h3 style={styles.centered}>次の問題がありません</h3>;
    }

    if (isJapaneseToEnglish) {
        return (
            <div style={styles.centered}>
                <h3>{isAnswer ? Phrases[currentQuestion].english : Phrases[currentQuestion].japanese}</h3>
                {isAnswer && <VolumeUp style={styles.icon} onClick={() => {soundUp(Phrases[currentQuestion].english);}}/>}
            </div>
        );
    } else {
        return (
            <div style={styles.centered}>
                <h3>{isAnswer ? Phrases[currentQuestion].japanese : Phrases[currentQuestion].english}</h3>
                {!isAnswer && <VolumeUp style={styles.icon} onClick={() => {soundUp(Phrases[currentQuestion].english);}}/>}
            </div>
        );
    }
};

const styles = {
    centered: {
        display: 'flex',
        flexDirection: 'column' as 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center' as 'center',
    },
    icon: {
        fontSize: '3rem',
        marginTop: '8px',
    },
};

export default Question;
