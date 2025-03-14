import { SnippetFolderResponse } from 'data/content/sql-folders-query'

export interface TreeViewItemProps {
  id: string | number
  name: string
  parent: number | string | null
  children: any[]
  metadata?: any
}

export const ROOT_NODE: TreeViewItemProps = { id: 0, name: '', parent: null, children: [] }

// [Joshen] At the moment this is only tuned for single level folders
// Will need to relook at this for multi level folders,
export const formatFolderResponseForTreeView = (
  response?: SnippetFolderResponse
): TreeViewItemProps[] => {
  if (response === undefined) return [ROOT_NODE]

  const { folders, contents } = response

  const formattedFolders =
    folders?.map((folder) => {
      const { id, name } = folder
      return {
        id,
        name,
        parent: 0,
        isBranch: true,
        children:
          contents?.filter((content) => content.folder_id === id).map((content) => content.id) ??
          [],
        metadata: folder,
      }
    }) || []

  const formattedContents =
    contents?.map((content) => {
      const { id, name, folder_id } = content
      return { id, name, parent: folder_id ?? 0, children: [], metadata: content }
    }) || []

  const root = {
    id: 0,
    name: '',
    parent: null,
    children: [
      ...(folders || [])?.map((folder) => folder.id),
      ...(contents || []).filter((content) => !content.folder_id)?.map((content) => content.id),
    ],
  }

  return [root, ...formattedFolders, ...formattedContents]
}

export function getLastItemIds(items: TreeViewItemProps[]) {
  let lastItemIds = new Set<string>()

  const topLevelItems = items.filter((item) => item.parent === 0)

  if (topLevelItems.length > 0) {
    const lastItem = topLevelItems[topLevelItems.length - 1]
    if (typeof lastItem.id === 'string') {
      lastItemIds.add(lastItem.id)
    }

    topLevelItems.forEach((item) => {
      if (item.children.length > 0) {
        const childrenLastItem = item.children[item.children.length - 1]

        if (typeof childrenLastItem === 'string') {
          lastItemIds.add(childrenLastItem)
        }
      }
    })
  }

  return lastItemIds
}
