import React, { cloneElement, ComponentProps, FC, KeyboardEvent, useEffect, useState } from 'react'
import classNames from 'classnames'

import { handleActionKeydown, handleLeftRightArrowsKeydown } from '../common/event-utils'
import { filterByType } from '../common/component-utils'
import { Activation, Size } from './types'
import Tab from './tab'
import TabPanel from './tab-panel'

export type TabsProps = ComponentProps<'div'> & {
    index?: number;
    size?: Size;
    activation?: Activation;
    onSelect?: ({ selectedIndex: number }) => void;
    /**
     * @deprecated Use onSelect instead
     */
    onTabSelect?: (index: number) => void;
};

const Tabs: FC<TabsProps> = ({
    id,
    className,
    index = 0,
    size = 'medium',
    activation = 'auto',
    onSelect = () => {},
    onTabSelect = () => {},
    children
}) => {
    const headings: HTMLElement[] = []

    const [selectedIndex, setSelectedIndex] = useState<number>(index)
    const [focusedIndex, setFocusedIndex] = useState<number>(index)

    const handleSelect = (i: number): void => {
        onSelect({ selectedIndex: i })
        onTabSelect(i)
        setSelectedIndex(i)
    }

    /**
     * Handle a11y for heading
     * https://ebay.gitbooks.io/mindpatterns/content/disclosure/tabs.html
     */
    const onKeyDown = (ev: KeyboardEvent, i: number): void => {
        handleActionKeydown(ev, () => {
            ev.preventDefault()

            if (activation === 'manual') {
                handleSelect(i)
            }
        })

        handleLeftRightArrowsKeydown(ev, () => {
            ev.preventDefault()

            const len = filterByType(children, Tab).length
            const direction = ['Left', 'ArrowLeft'].includes(ev.key) ? -1 : 1
            const currentIndex = focusedIndex === undefined ? selectedIndex : focusedIndex
            const nextIndex = (currentIndex + len + direction) % len
            setFocusedIndex(nextIndex)
            headings[nextIndex]?.focus()

            if (activation !== 'manual') {
                handleSelect(nextIndex)
            }
        })
    }

    useEffect(() => {
        handleSelect(index)
    }, [index])

    const isLarge = size === 'large'

    const tabHeadings = filterByType(children, Tab).map((item, i) =>
        cloneElement(item, {
            ...item.props,
            refCallback: ref => { headings[i] = ref },
            index: i,
            parentId: id,
            selected: selectedIndex === i,
            focused: focusedIndex === i,
            onClick: () => {
                handleSelect(i)
                setFocusedIndex(i)
            },
            onKeyDown: e => { onKeyDown(e, i) }
        }))

    const tabPanels = filterByType(children, TabPanel).map((item, i) => {
        const itemProps = {
            index: i,
            parentId: id,
            selected: selectedIndex === i,
            children: item.props.children
        }

        return cloneElement(item, itemProps)
    })

    return (
        <div id={id} className={classNames(className, 'tabs')}>
            <div className={classNames('tabs__items', { 'tabs__items--large': isLarge })} role="tablist">
                {tabHeadings}
            </div>
            <div className="tabs__content">
                {tabPanels}
            </div>
        </div>
    )
}

export default Tabs
