import '../styles/Homepage.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Filter from './Filter';
import Pagination from './Pagination';
import { Table } from 'react-bootstrap';
import {Button} from 'react-bootstrap';

export default function Homepage() {
    const userAccount = JSON.parse(localStorage.getItem("userAccount"));
    const navigate = useNavigate();

    const [allBooks, setAllBooks] = useState([]);
    const [displayBooks, setDisplayBooks] = useState([]);
    const [subjects, setSubjects] = useState(null);
    const [subTag, setSubTag] = useState(null);
    const [copies, setCopies] = useState(null);

    const [search, setSearch] = useState('');
    const [selectedSub, setSelectedSub] = useState([]);
    const [avail, setAvail] = useState('all');
    const [subSelector, setSubSelector] = useState(false);
    const [subSearch, setSubSearch] = useState('');

    const [totalPages, setTotalPages] = useState(0);
    const [currPage, setCurrPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const limit = 12;

    useEffect(() => {
        axios.get(`http://localhost:9999/books?hidden=false`)
            .then(res => {
                const sortedBooks = res.data.sort((a, b) => b.createTime - a.createTime);
                setAllBooks(sortedBooks);
            })
            .catch(err => console.log(err));

        axios.get('http://localhost:9999/subjects')
            .then(res => {
                const data = res.data;
                setSubjects(data);
                setSubTag(data);
            })
            .catch(err => console.log(err));

        axios.get('http://localhost:9999/copies/?condition=Good')
            .then(res => setCopies(res.data))
            .catch(err => console.log(err));
    }, []);

    useEffect(() => {
        if (subSearch !== '') {
            let filterSubs = subTag.filter(s => s.name.toLowerCase().trim().includes(subSearch.toLowerCase().trim()))
            let chosen = subTag.filter(s => selectedSub.includes(s.id))
            filterSubs = filterSubs.filter(s => !chosen.some(c => c.id === s.id));
            setSubjects([...chosen, ...filterSubs]);
        } else { setSubjects(subTag) };
    }, [subSearch, subTag])

    useEffect(() => {
        if (!allBooks || !copies) return;

        let filteredBooks = allBooks;

        if (search) {
            filteredBooks = filteredBooks.filter(b => {
                const s = search.toLowerCase().trim();
                return (
                    b.title?.toLowerCase().includes(s) ||
                    b.author?.toLowerCase().includes(s) ||
                    b.isbn?.includes(s) ||
                    b.olid?.includes(s)
                );
            });
        }

        if (selectedSub.length > 0) {
            filteredBooks = filteredBooks.filter(b =>
                selectedSub.every(subId => b.subjects.includes(subId))
            );
        }

        if (avail !== 'all') {
            filteredBooks = filteredBooks.filter(b => {
                const status = getStatus(b.id);
                const isAvailable = avail === 'true';
                return status.available === isAvailable;
            });
        }

        setTotalCount(filteredBooks.length);
        const newTotalPages = Math.ceil(filteredBooks.length / limit);
        setTotalPages(newTotalPages);

        if (currPage > newTotalPages && newTotalPages > 0) {
            setCurrPage(1);
        } else if (newTotalPages === 0) {
            setCurrPage(1);
        }

        const startIndex = (currPage - 1) * limit;
        const paginatedBooks = filteredBooks.slice(startIndex, startIndex + limit);
        setDisplayBooks(paginatedBooks);

    }, [search, selectedSub, avail, allBooks, copies, currPage]);

    const getStatus = (bId) => {
        let total = 0;
        let count = 0;
        if (copies) {
            copies.forEach(c => {
                if (c.bookId === bId) {
                    total += 1;
                    if (!c.isBorrowed) {
                        count += 1;
                    }
                }
            });
        }
        return {
            count,
            total,
            available: count > 0,
        };
    };

    const getDescription = (desc) => {
        if (!desc) return '';
        return `${desc.slice(0, 50).trim()}...`;
    };

    const addSubject = (sId) => {
        if (!selectedSub.includes(sId)) {
            setSelectedSub(prev => [...prev, sId]);
        }
    };

    const removeSubject = (sId) => {
        setSelectedSub(prev => prev.filter(id => id !== sId));
    };

    const selectedSubject = (sId) => {
        return selectedSub.includes(sId);
    };

    return (
        <div className='page-container'>
            <div className="welcome-banner p-5 rounded-4 text-white d-flex flex-column">
                <div className='fw-bold fs-2'>Welcome, {userAccount?.username}!</div>
                <div className='welcome-banner-subtitle mt-2'>Discover and check out books from our extensive collection</div>
                <div className='book-count-badge mt-4 py-1 px-3 rounded-2'>{totalCount} books available</div>
            </div>

            <Filter
                search={search}
                setSearch={setSearch}
                subSearch={subSearch}
                setSubSearch={setSubSearch}
                setSubSelector={setSubSelector}
                avail={avail}
                setAvail={setAvail}
                subSelector={subSelector}
                subjects={subjects}
                selectedSubject={selectedSubject}
                removeSubject={removeSubject}
                addSubject={addSubject}
                setSelectedSub={setSelectedSub}
            />

            <Table striped bordered hover responsive>
        <thead className="table-dark text-center align-middle">
          <tr>
            <th>Cover</th>
            <th>Title</th>
            <th>Author</th>
            <th>ISBN</th>
            <th>Copies</th>
            <th>Status</th>
            <th>Subjects</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody className="align-middle text-center">
          {displayBooks?.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-muted py-3">
                No Books Found!
              </td>
            </tr>
          ) : (
            displayBooks.map((b) => {
              const status = getStatus(b.id);

              return (
                <tr key={b.id}>
                  {/* Cover */}
                  <td>
                    <img
                      src={b.image}
                      alt={b.title}
                      style={{
                        width: "70px",
                        height: "90px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  </td>

                  {/* Title */}
                  <td className="fw-semibold">{b.title}</td>

                  {/* Author */}
                  <td>{b.author}</td>

                  {/* ISBN */}
                  <td>{b.isbn || "N/A"}</td>

                  {/* Copies */}
                  <td>
                    <div className="d-flex flex-column align-items-center">
                      <div
                        className={`status-icon ${
                          status.available ? "bg-success" : "bg-danger"
                        } rounded-circle`}
                        style={{ width: "10px", height: "10px" }}
                      ></div>
                      <span
                        className={status.available ? "text-success" : "text-danger"}
                      >
                        {status.count} of {status.total}
                      </span>
                    </div>
                  </td>

                  {/* Availability */}
                  <td>
                    {status.available ? (
                      <span className="badge bg-success">
                        <i className="bi bi-check2-circle"></i> Available
                      </span>
                    ) : (
                      <span className="badge bg-danger">
                        <i className="bi bi-x-circle"></i> Unavailable
                      </span>
                    )}
                  </td>

                  {/* Subjects */}
                  <td>
                    <div className="d-flex flex-wrap justify-content-center gap-1">
                      {b.subjects?.map((s) => (
                        <span key={s} className="badge bg-secondary">
{subTag?.find((sub) => sub.id === s)?.name || s}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Description */}
                  <td className="text-start small">{getDescription(b.description)}</td>

                  {/* Action */}
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/book/${b.id}`)}
                    >
                      View Detail
                    </Button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>


            <Pagination
                totalPages={totalPages}
                currPage={currPage}
                setCurrPage={setCurrPage}
            />
        </div >
    );
}