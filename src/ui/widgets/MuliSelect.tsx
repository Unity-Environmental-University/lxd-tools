///Original from ChatGPT
import React, {useState} from 'react';
import './MultiSelect.css'

export interface IMultiSelectOption {
    key: number | string;
    label: string;
}

export function optionize<BaseType extends Object>(
    objects: BaseType[],
    idFunc?: (object: BaseType) => number | string,
    labelFunc?: (object: BaseType) => string
) {

    let idGenerator = function* (i: number) {
        while (true) {
            yield i;
            i++;
        }
    }(0);

    type ObjectType = typeof objects[number];
    const options: (ObjectType & IMultiSelectOption)[] = objects.map(object => {
        let key = idFunc ? idFunc(object) : idGenerator.next().value;
        let label = labelFunc ? labelFunc(object) : key.toString();
        const modObject:Record<string, any> = object;
        modObject.key = key;
        modObject.label = label;
        const returnObject: ObjectType & Partial<IMultiSelectOption> = object;
        returnObject.key = key;
        returnObject.label = label;
        return returnObject as ObjectType & IMultiSelectOption;

    });
    return options;
}


interface MultiSelectProps<SelectedType extends IMultiSelectOption> {
    alwaysOpen?: boolean,
    options: SelectedType[];
    selectedOptions: SelectedType[];
    onSelectionChange: (selectedOptions: SelectedType[]) => void;
}

function MultiSelect<SelectedType extends IMultiSelectOption>({
    alwaysOpen,
    options,
    selectedOptions,
    onSelectionChange
}: MultiSelectProps<SelectedType>) {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (option: SelectedType & IMultiSelectOption) => {
        if (selectedOptions.find((selected) => selected.key === option.key)) {
            onSelectionChange(selectedOptions.filter((selected) => selected.key !== option.key));
        } else {
            onSelectionChange([...selectedOptions, option]);
        }
    };

    return (
        <div className="multi-select">
            <div className="multi-select-input" onClick={handleToggle}>
                {selectedOptions.length > 0 ? (
                    selectedOptions.map((option) => option.label).join(', ')
                ) : (
                    'Select options'
                )}
                <span className="arrow">{isOpen ? '▲' : '▼'}</span>
            </div>
            {(isOpen || alwaysOpen) && (
                <div className={alwaysOpen? "multi-select-options-dont-close" : "multi-select-options"}>
                    {options.map((option) => (
                        <div
                            key={option.key}
                            className={`multi-select-option ${selectedOptions.find((selected) => selected.key === option.key) ? 'selected' : ''}`}
                            onClick={() => handleOptionClick(option)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultiSelect;
