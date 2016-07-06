using System;
using System.Collections.Generic;
using NUnit.Framework;
using ServiceStack;
using ServiceStack.Testing;
using Gistlyn.ServiceModel;
using Gistlyn.ServiceInterface;
using Gistlyn.SnippetEngine;
using ServiceStack.DataAnnotations;
using ServiceStack.OrmLite;
using ServiceStack.Text;

namespace Gistlyn.Tests
{
    [TestFixture]
    public class UnitTests
    {
        private readonly ServiceStackHost appHost;

        public UnitTests()
        {
            appHost = new BasicAppHost(typeof(RunScriptService).Assembly)
            {
                ConfigureContainer = container =>
                {
                    //Add your IoC dependencies here
                }
            }
            .Init();
        }

        [TestFixtureTearDown]
        public void TestFixtureTearDown()
        {
            appHost.Dispose();
        }

        [Test]
        public void TestMethod1()
        {
            //var service = appHost.Container.Resolve<RunScriptService>();

            //var response = (HelloResponse)service.Any(new Hello { Name = "World" });

            //Assert.That(response.Result, Is.EqualTo("Hello, World!"));
        }


        public class User
        {
            public long Id { get; set; }

            [Index]
            public string Name { get; set; }

            public DateTime CreatedDate { get; set; }
        }

        [Test]
        public void Can_detect_Circular_References_in_OrmLite_scripts()
        {
            var dbFactory = new OrmLiteConnectionFactory(":memory:", SqliteDialect.Provider);
            using (var db = dbFactory.OpenDbConnection())
            {
                db.DropAndCreateTable<User>();

                db.Insert(new User
                {
                    Id = 1,
                    Name = "A",
                    CreatedDate = DateTime.Now
                });
                db.Insert(new User { Id = 2, Name = "B", CreatedDate = DateTime.Now });
                db.Insert(new User { Id = 3, Name = "B", CreatedDate = DateTime.Now });

                var rowsB = db.Select<User>("Name = @name", new { name = "B" });

                var rowIds = rowsB.ConvertAll(x => x.Id);

                Assert.That(ScriptUtils.HasCircularReferences(SqliteDialect.Provider));
                Assert.That(ScriptUtils.HasCircularReferences(dbFactory));
                Assert.That(ScriptUtils.HasCircularReferences(db));
                Assert.That(!ScriptUtils.HasCircularReferences(rowsB));
                Assert.That(!ScriptUtils.HasCircularReferences(rowsB[0]));
                Assert.That(!ScriptUtils.HasCircularReferences(rowIds));
            }
        }

        public class Node
        {
            public Node(int id, params Node[] children)
            {
                Id = id;
                Children = children;
            }

            public int Id { get; set; }

            public Node[] Children { get; set; }
        }

        [Test]
        public void Can_detect_Circular_References_in_models()
        {
            var node = new Node(1,
                new Node(11, new Node(111)),
                new Node(12, new Node(121)));

            Assert.That(!ScriptUtils.HasCircularReferences(node));

            var root = new Node(1,
                new Node(11));

            var cyclicalNode = new Node(1, root);
            root.Children[0].Children = new[] { cyclicalNode };

            Assert.That(ScriptUtils.HasCircularReferences(root));
        }
    }
}
