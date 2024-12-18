import { Tag, User } from 'interfaces';
import { viewAllTags } from 'lib/api/cradTags';
import { SelectChangeEvent } from '@mui/material';

export const addTag = (newTag: string, tags: Tag[], selectedTags: Tag[]) => {
    const newTags: Tag[] = [];

    if (newTag && !tags.map(tag => tag.name).includes(newTag)) {
        newTags.push({ name: newTag });
    }

    selectedTags.forEach(tag => {
        if (!tags.map(t => t.name).includes(tag.name)) {
            newTags.push(tag);
        }
    });

    return newTags
};

export const tagChange = (event: SelectChangeEvent<string[]>, registeredTag: Tag[]) => {
    const selectedTagNames = event.target.value as string[];
    const selectedTags = registeredTag.filter(tag => selectedTagNames.includes(tag.name));
    return selectedTags;
};

export const recieveAllTags = async (currentUser: User | undefined, setRegisteredTag: (selectedTag: Tag[]) => void) => {
    try {
        if (currentUser?.id === undefined) {
            console.error('User ID is undefined');
            return;
        }
        const res = await viewAllTags(currentUser.id);
        setRegisteredTag(res.data.tags);
    } catch (err) {
        console.error("Error fetching tags:", err);
        alert("タグの取得中にエラーが発生しました。再度お試しください。");
    }
};
