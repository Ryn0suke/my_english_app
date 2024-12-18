import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from 'App';
import { viewAllPhrases } from 'lib/api/cradPhrases';
import { Phrase, SearchOptions } from 'interfaces';
import { VolumeUp } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Button,
    Box,
} from '@mui/material';

import RegisterAndSearchModal from 'components/modals/Phrases/RegisterAndSearchModal';
import UpdateModal from 'components/modals/Phrases/UpdateModal';
import CheckState from 'components/modals/Phrases/CheckState';

import CommonButton from 'components/ui/Button';

import soundUp from 'components/utils/Sound';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    minWidth: 650,
    [theme.breakpoints.down('sm')]: { 
        minWidth: 325, 
    },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    '&.japaneseColumn': {
        width: '200px',
        [theme.breakpoints.down('sm')]: {
            width: '100px',
        },
    },
    '&.englishColumn': {
        width: '200px',
        [theme.breakpoints.down('sm')]: {
            width: '100px',
        },
    },
    '&.checkStateColumn': {
        width: '150px',
        [theme.breakpoints.down('sm')]: {
            width: '75px',
        },
    },
    '&.tagsColumn': {
        width: '300px',
        [theme.breakpoints.down('sm')]: {
            width: '150px',
        },
    },
}));

const Phrases: React.FC = () => {
    const { currentUser } = useContext(AuthContext);
    const [phrases, setPhrases] = useState<Phrase[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPage, setTotalPage] = useState<number>(1);
    const pageNumbers: number[] = [...new Array(totalPage).keys()].map(number => ++number).slice(Math.max(0, currentPage - 6), Math.min(totalPage, currentPage + 4));
    const [registerModalIsOpen, setRegisterModalIsOpen] = useState<boolean>(false);
    const [updateModalIsOpen, setUpdateModalIsOpen] = useState<boolean>(false);
    const [selectedPhrase, setSelectedPhrase] = useState<Phrase>({ id: -1, japanese: '', english: '', state1: false, state2: false, state3: false, tags: [] });
    const [searchOptions, setSearchOptions] = useState<SearchOptions>({ japanese: '', english: '', tags: [{ name: '' }], isPartialMatch: true });

    const recieveAllPhrases = async (page: number, searchOptions: SearchOptions) => {
        try {
            if (currentUser?.id === undefined) {
                return;
            }
            const res = await viewAllPhrases(currentUser.id, page, searchOptions);
            setPhrases(res.data.phrases);
            setTotalPage(res.data.total_pages);
        } catch (err) {
            console.error(err);
        }
    };

    const changeCurrentPage = (page: number) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        recieveAllPhrases(currentPage, searchOptions);
    }, [currentUser, currentPage, searchOptions]);

    return (
        <>
            <CommonButton onClick={() => setRegisterModalIsOpen(true)} children='登録・検索' />
            <CommonButton onClick={() => setSearchOptions({ japanese: '', english: '', tags: [{ name: '' }], isPartialMatch: true })} children='検索解除' />

            <RegisterAndSearchModal registerModalIsOpen={registerModalIsOpen} setRegisterModalIsOpen={setRegisterModalIsOpen} recieveAllPhrases={recieveAllPhrases} currentPage={currentPage} searchOptions={searchOptions} setSearchOptions={setSearchOptions} />

            <Paper>
                <StyledTableContainer>
                    <Table aria-label="phrase table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell className="japaneseColumn">日本語</StyledTableCell>
                                <StyledTableCell className="englishColumn">英語</StyledTableCell>
                                <StyledTableCell className="englishColumn">音声</StyledTableCell>
                                <StyledTableCell className="checkStateColumn">チェック状態</StyledTableCell>
                                <StyledTableCell className="tagsColumn">タグ</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {phrases?.map((row) => (
                                <TableRow key={row.id}>
                                    <StyledTableCell className="japaneseColumn" component='th' scope='row' onClick={() => { setUpdateModalIsOpen(true); setSelectedPhrase({ id: row.id, japanese: row.japanese, english: row.english, state1: row.state1, state2: row.state2, state3: row.state3, tags: row.tags }); }}>
                                        {row.japanese}
                                    </StyledTableCell>
                                    <StyledTableCell className="englishColumn" component='th' scope='row' onClick={() => { setUpdateModalIsOpen(true); setSelectedPhrase({ id: row.id, japanese: row.japanese, english: row.english, state1: row.state1, state2: row.state2, state3: row.state3, tags: row.tags }); }}>
                                        {row.english}
                                    </StyledTableCell>
                                    <StyledTableCell className="englishColumn" component='th' scope='row'>
                                        <VolumeUp onClick={() => { soundUp(row.english); }} />
                                    </StyledTableCell>
                                    <StyledTableCell className="checkStateColumn">
                                        <CheckState state1={row.state1} state2={row.state2} state3={row.state3} isLock={true} />
                                    </StyledTableCell>
                                    <StyledTableCell className="tagsColumn" component='th' scope='row'>
                                        {row.tags !== undefined ? (
                                            <Box>
                                                {row.tags.map((tag) => (
                                                    <Chip
                                                        key={tag.id}
                                                        label={tag.name}
                                                        sx={{ marginRight: '8px', marginBottom: '4px' }}
                                                    />
                                                ))}
                                            </Box>
                                        ) : (
                                            <div></div>
                                        )}
                                    </StyledTableCell>
                                </TableRow>
                            ))}
                            <UpdateModal updateModalIsOpen={updateModalIsOpen} setUpdateModalIsOpen={setUpdateModalIsOpen} recieveAllPhrases={recieveAllPhrases} currentPage={currentPage} phrase={selectedPhrase} searchOptions={searchOptions} />
                        </TableBody>
                    </Table>
                </StyledTableContainer>
            </Paper>

            <CommonButton onClick={() => changeCurrentPage(1)} children='＜' />

            {
                pageNumbers.map((page) => {
                    return (
                        <CommonButton key={page} onClick={() => changeCurrentPage(page)} children={String(page)} color={page === currentPage ? 'secondary' : 'primary'} />
                    )
                })
            }
            <CommonButton onClick={() => changeCurrentPage(totalPage)} children='＞' />
        </>
    );
}

export default Phrases;
